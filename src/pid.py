import io
import numpy as np
from scipy.integrate import odeint
import warnings
import random

# Modelo: First Order Plus Dead Time (FOPDT)


class PID_Controller(object):
    def __init__(self, mode, loop):
        self.Kp, self.Ki, self.Kd = 0, 0, 0
        self._min_output, self._max_output = -100, 200
        self._proportional = 0
        self._integral = 0
        self._derivative = 0
        self.output_limits = (-100, 200)
        self._last_eD = 0
        self._lastMV = 0
        self._d_init = 0
        self.mode = mode
        self.loop = loop
        self.manualMV = 0
        self.reset()

    def __call__(self, PV=0, SP=0):
        if(self.mode == "MANUAL"):
            return self.manualMV
        e = SP - PV if self.loop == "CLOSED" else PV - SP
        self._proportional = self.Kp * e

        if self._lastMV < 100 and self._lastMV > 0:
            self._integral += self.Ki * e

        if self.Kp == 0 and self._lastMV >= 100 and self.Ki * e < 0:
            self._integral += self.Ki * e
        if self.Kp == 0 and self._lastMV <= 0 and self.Ki * e > 0:
            self._integral += self.Ki * e

        eD = -PV
        self._derivative = self.Kd * (eD - self._last_eD)

        if self._d_init == 0:
            self._derivative = 0
            self._d_init = 1

        MV = self._proportional + self._integral + self._derivative
        MV = self._clamp(MV, self.output_limits)

        self._last_eD = eD
        self._lastMV = MV
        self.manualMV = MV
        return MV

    @property
    def components(self):
        return self._proportional, self._integral, self._derivative

    @property
    def tunings(self):
        return self.Kp, self.Ki, self.Kd

    @tunings.setter
    def tunings(self, tunings):
        self.Kp, self.Ki, self.Kd = tunings

    @property
    def output_limits(self):
        return self._min_output, self._max_output

    @output_limits.setter
    def output_limits(self, limits):
        if limits is None:
            self._min_output, self._max_output = -100, 200
            return
        min_output, max_output = limits
        self._min_output = min_output
        self._max_output = max_output
        self._integral = self._clamp(self._integral, self.output_limits)

    def reset(self):
        self._proportional = 0
        self._integral = 0
        self._derivative = 0
        self._integral = self._clamp(self._integral, self.output_limits)
        self._last_eD = 0
        self._d_init = 0
        self._lastMV = 0

    def _clamp(self, value, limits):
        lower, upper = limits
        if value is None:
            return None
        elif (upper is not None) and (value > upper):
            return upper
        elif (lower is not None) and (value < lower):
            return lower
        return value

    def setKp(self, newKp):
        self.Kp = newKp

    def setKi(self, newKi):
        self.Ki = newKi

    def setKd(self, newKd):
        self.Kd = newKd

    def setManualMV(self, newMV):
        self.manualMV = newMV

    def setLoop(self, newLoop):
        self.loop = newLoop


class FOPDT_Model(object):
    def __init__(self, loop):
        self.work_MV = []
        self.loop = loop
        self.manualPV = 50

    def change_params(self, data):
        self.Gain, self.Time_Constant, self.Dead_Time, self.Bias = data

    def _calc(self, work_PV, ts):
        if (ts - self.Dead_Time) <= 0:
            um = 0
        elif int(ts - self.Dead_Time) >= len(self.work_MV):
            um = self.work_MV[-1]
        else:
            um = self.work_MV[int(ts - self.Dead_Time)]
        dydt = (-(work_PV) + self.Gain * um) / self.Time_Constant
        return dydt

    def update(self, work_PV, ts):
        if(self.loop == "OPEN"):
            return self.manualPV
        y = odeint(self._calc, work_PV, ts)
        pv = y[-1]
        self.manualPV = pv
        return pv

    def setLoop(self, newLoop):
        self.loop = newLoop

    def setManualPV(self, newPV):
        self.manualPV = newPV


class Simulator:
    def __init__(self, params):
        self.mode = params.get("mode")
        self.loop = params.get("loop")
        self.direction = params.get("controller_action")
        self.model_gain = params.get("model_gain")
        self.model_tc = params.get("model_tc")
        self.model_dt = params.get("model_dt")
        self.model_bias = params.get("model_bias")
        self.model_noise_min = params.get("model_noise_min")
        self.model_noise_max = params.get("model_noise_max")
        self.initSP = params.get("initSP")
        self.newSP = self.initSP

        self.kp = params.get("kp")
        self.ki = params.get("ki")
        self.kd = params.get("kd")
        self.SP = params.get("sp")

        self.maxsize = 3600 + 1

        self.noise = np.random.uniform(
            self.model_noise_min, self.model_noise_max, self.maxsize
        )
        self.noise *= np.random.choice([-1, 1], self.maxsize)

        self.pid = PID_Controller(self.mode, self.loop)
        self.process_model = FOPDT_Model(self.loop)

        self.SP = np.zeros(self.maxsize)
        self.PV = np.zeros(self.maxsize)
        self.MV = np.zeros(self.maxsize)

        self.moment = 0

        i = self.moment

        self.process_model.change_params(
            (self.model_gain, self.model_tc, self.model_dt, self.model_bias)
        )
        self.process_model.work_MV = self.MV

        self.pid.tunings = (self.kp, self.ki, self.kd)
        self.pid.reset()

        if i == 0:
            self.PV[0] = self.initSP

    def pulse(self):
        i = self.moment
        if i == 0:
            self.SP[i] = self.initSP
        else:
            self.SP[i] = self.newSP

        self.MV[i] = self.pid(self.PV[i], self.SP[i])

        if i < (self.maxsize - 1):
            self.PV[i + 1] = (
                self.process_model.update(self.PV[i], [i, i + 1]) + self.noise[i]
            )
        else:
            self.PV[i] = self.PV[i - 1] + self.noise[i]

        mv_bias = (
            (self.MV[i] + self.model_bias)
            if self.direction == "DIRECT"
            else (self.MV[i] - self.model_bias)
        )

        data = {
            "moment": self.moment,
            "SP": round(self.SP[i], 2),
            "PV": round(self.PV[i], 2),
            "MV": round(mv_bias, 2),
        }

        self.moment += 1

        return data

    def setSP(self, value):
        self.newSP = value

    def setMV(self, value):
        self.pid.setManualMV(value)

    def setPV(self, value):
        self.process_model.setManualPV(value)

    def setKp(self, value):
        self.kp = value
        self.pid.setKp(self.kp)

    def setKi(self, value):
        self.ki = value
        self.pid.setKi(self.ki)

    def setKd(self, value):
        self.kd = value
        self.pid.setKd(self.kd)

    def setBias(self, value):
        self.model_bias = value
        self.process_model.change_params(
            (self.model_gain, self.model_tc, self.model_dt, self.model_bias)
        )

    def setNoise(self, minNoise, maxNoise):
        self.model_noise_min = minNoise
        self.model_noise_max = maxNoise
        self.noise = np.random.uniform(
            self.model_noise_min, self.model_noise_max, self.maxsize
        )
        self.noise *= np.random.choice([-1, 1], self.maxsize)

    def setMode(self, mode):
        self.mode = mode
        self.pid.mode = mode

    def setLoop(self, loop):
        self.process_model.setLoop(loop)
        self.pid.setLoop(loop)