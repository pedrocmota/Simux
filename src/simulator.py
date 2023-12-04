import io
import numpy as np
from scipy.integrate import odeint
import warnings
import random

# Modelo: First Order Plus Dead Time (FOPDT)


class PID_Controller(object):
    def __init__(self):
        self.Kp, self.Ki, self.Kd = 0, 0, 0
        self.setpoint = 50
        self._min_output, self._max_output = 0, 100
        self._proportional = 0
        self._integral = 0
        self._derivative = 0
        self.output_limits = (0, 100)
        self._last_eD = 0
        self._lastMV = 0
        self._d_init = 0
        self.reset()

    def __call__(self, PV=0, SP=0, direction="Direct"):
        e = SP - PV
        self._proportional = self.Kp * e

        if self._lastMV < 100 and self._lastMV > 0:
            self._integral += self.Ki * e

        if self.Kp == 0 and self._lastMV == 100 and self.Ki * e < 0:
            self._integral += self.Ki * e
        if self.Kp == 0 and self._lastMV == 0 and self.Ki * e > 0:
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
            self._min_output, self._max_output = 0, 100
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


class FOPDT_Model(object):
    def __init__(self):
        self.work_MV = []

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
        y = odeint(self._calc, work_PV, ts)
        return y[-1]


class Simulator:
    def __init__(self, params):
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

        self.pid = PID_Controller()
        self.process_model = FOPDT_Model()

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

    def get(self):
        i = self.moment
        if i == 0:
            self.SP[i] = self.initSP
        else:
            self.SP[i] = self.newSP

        self.MV[i] = self.pid(self.PV[i], self.SP[i], self.direction)

        if i < (self.maxsize - 1):
            self.PV[i + 1] = (
                self.process_model.update(self.PV[i], [i, i + 1]) + self.noise[i]
            )
        else:
            self.PV[i] = self.PV[i - 1] + self.noise[i]

        mv_bias = (
            (self.MV[i] + self.model_bias)
            if self.direction == "Direct"
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

    def setKp(self, value):
        self.kp = value
        self.pid.setKp(self.kp)

    def setKi(self, value):
        self.ki = value
        self.pid.setKi(self.ki)

    def setKd(self, value):
        self.kd = value
        self.pid.setKd(self.kd)
