import io
import matplotlib.pyplot as plt
import numpy as np
import ttkbootstrap as ttk
from PIL import Image, ImageTk
from scipy.integrate import odeint
from tkinter import messagebox
import warnings
import random

class PID_Controller(object):
    def __init__(self):
        self.Kp, self.Ki, self.Kd = 1, 0.1, 0
        self.setpoint = 50
        self._min_output, self._max_output = 0, 100
        self._proportional = 0
        self._integral = 0
        self._derivative = 0
        self.output_limits = (0, 100)
        self._last_eD = 0
        self._lastCV = 0
        self._d_init = 0
        self.reset()

    def __call__(self, PV=0, SP=0, direction="Direct"):
        """
        Calculate the control value (CV) based on the process variable (PV) and the setpoint (SP).
        """

        # P term
        if direction == "Direct":
            e = SP - PV
        else:
            e = PV - SP
        self._proportional = self.Kp * e

        # I Term
        if self._lastCV < 100 and self._lastCV > 0:
            self._integral += self.Ki * e
        # Allow I Term to change when Kp is set to Zero
        if self.Kp == 0 and self._lastCV == 100 and self.Ki * e < 0:
            self._integral += self.Ki * e
        if self.Kp == 0 and self._lastCV == 0 and self.Ki * e > 0:
            self._integral += self.Ki * e

        # D term
        eD = -PV
        self._derivative = self.Kd * (eD - self._last_eD)

        # init D term
        if self._d_init == 0:
            self._derivative = 0
            self._d_init = 1

        # Controller Output
        CV = self._proportional + self._integral + self._derivative
        CV = self._clamp(CV, self.output_limits)

        # update stored data for next iteration
        self._last_eD = eD
        self._lastCV = CV
        return CV

    @property
    def components(self):
        """
        Get the individual components of the controller output.
        """
        return self._proportional, self._integral, self._derivative

    @property
    def tunings(self):
        """
        Get the current PID tuning values (Kp, Ki, and Kd).
        """
        return self.Kp, self.Ki, self.Kd

    @tunings.setter
    def tunings(self, tunings):
        """
        Set new PID tuning values (Kp, Ki, and Kd).
        """
        self.Kp, self.Ki, self.Kd = tunings

    @property
    def output_limits(self):
        """
        Get the current output limits (minimum and maximum allowed controller output values).
        """
        return self._min_output, self._max_output

    @output_limits.setter
    def output_limits(self, limits):
        """
        Set new output limits (minimum and maximum allowed controller output values).
        """
        if limits is None:
            self._min_output, self._max_output = 0, 100
            return
        min_output, max_output = limits
        self._min_output = min_output
        self._max_output = max_output
        self._integral = self._clamp(self._integral, self.output_limits)

    def reset(self):
        """
        Reset the controller values to their initial state.
        """
        self._proportional = 0
        self._integral = 0
        self._derivative = 0
        self._integral = self._clamp(self._integral, self.output_limits)
        self._last_eD = 0
        self._d_init = 0
        self._lastCV = 0

    def _clamp(self, value, limits):
        """
        Clamp the given value between the specified limits.
        """
        lower, upper = limits
        if value is None:
            return None
        elif (upper is not None) and (value > upper):
            return upper
        elif (lower is not None) and (value < lower):
            return lower
        return value


class FOPDT_Model(object):
    """
    First Order Plus Dead Time (FOPDT) Model.
    """

    def __init__(self):
        """
        Initialize the FOPDTModel with an empty list to store control values (CV).
        """
        self.work_CV = []

    def change_params(self, data):
        """
        Update the model parameters with new values.
        """
        self.Gain, self.Time_Constant, self.Dead_Time, self.Bias = data

    def _calc(self, work_PV, ts):
        """
        Calculate the change in the process variable (PV) over time.
        """
        if (ts - self.Dead_Time) <= 0:
            um = 0
        elif int(ts - self.Dead_Time) >= len(self.work_CV):
            um = self.work_CV[-1]
        else:
            um = self.work_CV[int(ts - self.Dead_Time)]
        dydt = (-(work_PV - self.Bias) + self.Gain * um) / self.Time_Constant
        return dydt

    def update(self, work_PV, ts):
        """
        Update the process variable (PV) using the FOPDT model.
        """


        y = odeint(self._calc, work_PV, ts)
        return y[-1]


class App(object):
    """
    Python PID Simulator Application.

    This application provides a Graphical User Interface (GUI) to simulate and visualize the response
    of a Proportional-Integral-Derivative (PID) controller using the First Order Plus Dead Time (FOPDT) model.
    """

    def __init__(self):
        """
        Initialize the PID Simulator application.
        """
        self.root = ttk.Window()
        self.root.title("Python PID Simulator - PID Tuning Ireland©")
        self.root.state("zoomed")
        # Adjust theme to suit
        style = ttk.Style(theme="yeti")
        style.theme.colors.bg = "#c0c0c0"
        style.configure(".", font=("Helvetica", 12))
        # Add frames
        self.master_frame = ttk.Frame(self.root)
        self.master_frame.pack(fill="both", expand=True)
        self.bottom_frame = ttk.Frame(self.master_frame)
        self.bottom_frame.pack(side="bottom", fill="both", expand=True)
        self.left_frame = ttk.LabelFrame(self.master_frame, text=" Controller ", bootstyle="Success")
        self.left_frame.pack(side="left", fill="both", expand=True, padx=10, pady=10)
        self.middle_frame = ttk.LabelFrame(self.master_frame, text=" Result ", bootstyle="Light")
        self.middle_frame.pack(side="left", fill="both", expand=True, padx=10, pady=10)
        self.right_frame = ttk.LabelFrame(self.master_frame, text=" Process ", bootstyle="Warning")
        self.right_frame.pack(side="right", fill="both", expand=True, padx=10, pady=10)

        #NEW VARIABLES
        self.model_gain = 2
        self.model_tc = 20.0
        self.model_dt = 5.0
        self.model_bias = 50.0

        self.kp = 2.0
        self.ki = 0.1
        self.kd = 6.0 #aqui
        # GUI Variables
        # self.model_gain = ttk.DoubleVar(value=2)
        # self.model_tc = ttk.DoubleVar(value=20.0)
        # self.model_dt = ttk.DoubleVar(value=5.0)
        # self.model_bias = ttk.DoubleVar(value=50.0)
        # self.kp = ttk.DoubleVar(value=1.9)
        # self.ki = ttk.DoubleVar(value=0.1)
        # self.kd = ttk.DoubleVar(value=0)

        # Left Frame Static Text
        # ttk.Label(self.left_frame, text="PID Gains").grid(row=0, column=0, padx=10, pady=10, columnspan=2)
        # ttk.Label(self.left_frame, text="Kp:").grid(row=1, column=0, padx=10, pady=10)
        # ttk.Label(self.left_frame, text="Ki (1/sec):").grid(row=2, column=0, padx=10, pady=10)
        # ttk.Label(self.left_frame, text="Kd (sec):").grid(row=3, column=0, padx=10, pady=10)
        # Left Frame Entry Boxes
        # ttk.Spinbox(self.left_frame, from_=-1000.00, to=1000.00, increment=0.1, textvariable=self.kp, width=15).grid(row=1, column=1, padx=10, pady=10)
        # ttk.Spinbox(self.left_frame, from_=-1000.00, to=1000.00, increment=0.01, textvariable=self.ki, width=15).grid(row=2, column=1, padx=10, pady=10)
        # ttk.Spinbox(self.left_frame, from_=-1000.00, to=1000.00, increment=0.01, textvariable=self.kd, width=15).grid(row=3, column=1, padx=10, pady=10)

        # Button
        button_refresh = ttk.Button(self.left_frame, text="Refresh", command=self.generate_response, bootstyle="Success")
        button_refresh.grid(row=5, column=0, columnspan=2, sticky="NESW", padx=10, pady=10)

        # Middle Frame
        self.plot_label = ttk.Label(self.middle_frame)
        self.plot_label.pack(padx=10, pady=10)

        # Right Frame Static Text
        # ttk.Label(self.right_frame, text="First Order Plus Dead Time Model").grid(row=0, column=0, columnspan=2, padx=10, pady=10)
        # ttk.Label(self.right_frame, text="Model Gain: ").grid(row=1, column=0, padx=10, pady=10)
        # ttk.Label(self.right_frame, text="Time Constant (seconds):").grid(row=2, column=0, padx=10, pady=10)
        # ttk.Label(self.right_frame, text="Dead Time (seconds):").grid(row=3, column=0, padx=10, pady=10)
        # ttk.Label(self.right_frame, text="Bias:").grid(row=4, column=0, padx=10, pady=10)
        # Right Frame Entry Boxes
        # ttk.Spinbox(self.right_frame, from_=-1000.00, to=1000.00, increment=0.1, textvariable=self.model_gain, width=15).grid(row=1, column=1, padx=10, pady=10)
        # ttk.Spinbox(self.right_frame, from_=1.00, to=1000.00, increment=0.1, textvariable=self.model_tc, width=15).grid(row=2, column=1, padx=10, pady=10)
        # ttk.Spinbox(self.right_frame, from_=1.00, to=1000.00, increment=0.1, textvariable=self.model_dt, width=15).grid(row=3, column=1, padx=10, pady=10)
        # ttk.Spinbox(self.right_frame, from_=-1000.00, to=1000.00, increment=0.1, textvariable=self.model_bias, width=15).grid(row=4, column=1, padx=10, pady=10)

        # Random noise between -0.25 and 0.25, same set used for each run as it's created once at runtime.
        # self.minsize = 300
        self.maxsize = 300
        self.noise = np.random.rand(self.maxsize) / 2
        self.noise -= 0.25
        # PID and Process Instantiation
        self.pid = PID_Controller()
        self.process_model = FOPDT_Model()
        self.sim_length = self.maxsize
        # self.itae = 0
        # Create arrays to store the simulation results
        self.SP = np.zeros(self.maxsize)
        self.PV = np.zeros(self.maxsize)
        self.CV = np.zeros(self.maxsize)
        # self.pterm = np.zeros(self.maxsize)
        # self.iterm = np.zeros(self.maxsize)
        # self.dterm = np.zeros(self.maxsize)
        # Create plot buffer and generate blank plot
        self.image_buffer = io.BytesIO()
        self.generate_plot()

    def generate_response(self):
        """
        Generate the response of the PID controller and the FOPDT model.

        This method calculates the control values, process variable, and individual controller
        components based on the given model parameters and PID gains. It also calculates the
        Integral Time Weighted Average of the Error (ITAE) as a performance measure.
        """
        try:
            # Find the size of the range needed
            calc_duration = int(self.model_dt * 2 + self.model_tc * 5)
            self.sim_length = self.maxsize - 1

            # print(self.sim_length)

            # Defaults
            start_of_step = 10
            direction = "Direct" if self.model_gain > 0 else "Reverse"

            # Update Process model
            self.process_model.change_params((self.model_gain, self.model_tc, self.model_dt, self.model_bias))
            self.process_model.work_CV = self.CV
            # Get PID ready
            self.pid.tunings = (self.kp, self.ki, self.kd)
            self.pid.reset()
            # Set initial value
            # self.PV[0] = self.model_bias + self.noise[0]
            self.PV[0] = self.model_bias

            # Loop through timestamps
            for i in range(self.sim_length):
                # print(i)
                # Adjust the Setpoint
                if i < start_of_step:
                    self.SP[i] = self.model_bias
                elif direction == "Direct":
                    self.SP[i] = 30 + self.model_bias if i < self.sim_length * 0.6 else 20 + self.model_bias
                else:
                    self.SP[i] = -30 + self.model_bias if i < self.sim_length * 0.6 else -20 + self.model_bias
                # Find current controller output
                self.CV[i] = self.pid(self.PV[i], self.SP[i], direction)
                # Find calculated PV
                self.PV[i + 1] = self.process_model.update(self.PV[i], [i, i + 1])
                # self.PV[i + 1] += self.noise[i]
                # Store individual terms
                # self.pterm[i], self.iterm[i], self.dterm[i] = self.pid.components
                # Calculate Integral Time weighted Average of the Error (ITAE)
                # self.itae = 0 if i < start_of_step else self.itae + (i - start_of_step) * abs(self.SP[i] - self.PV[i])
            # Update the plot
          
            self.generate_plot()

        except Exception as e:
            messagebox.showerror("An Error Occurred", "Check Configuration: " + str(e))

    def generate_plot(self):
        """
        Generate the plot for the response of the PID controller and the FOPDT model.
        """
        plt.figure()
        plt.subplot(2, 1, 1)
        plt.plot(self.SP[: self.sim_length], color="blue", linewidth=2, label="SP")
        plt.plot(self.CV[: self.sim_length], color="darkgreen", linewidth=2, label="CV")
        plt.plot(self.PV[: self.sim_length], color="red", linewidth=2, label="PV")
        plt.ylabel("Value")
        # plt.suptitle("ITAE: %s" % round(self.itae / self.sim_length, 2))
        plt.title("Kp:%s   Ki:%s  Kd:%s" % (self.kp, self.ki, self.kd), fontsize=10)
        plt.legend(loc="best")
        plt.ylim([0, 100])
        plt.yticks([0,10,20,30,40,50,60,70,80,90,100])

        plt.savefig(self.image_buffer, format="png")
        plt.close()

        # Convert plot to tkinter image
        img = Image.open(self.image_buffer)
        photo_img = ImageTk.PhotoImage(img)
        # Delete the existing plot
        self.plot_label.configure(image="")
        self.plot_label.image = ""
        # Add the new plot
        self.plot_label.configure(image=photo_img)
        self.plot_label.image = photo_img
        # Rewind the tape
        self.image_buffer.seek(0)


# NOVA PARTE DO CODIGO
####
####
####
####
####
####
####
####
####
####
####
####
####
####
####
####
####
####
####
####
####
####
####
####
####
####
####
####
####
####
####
####
####
####
####
####


class Simulator:
  def __init__(self, params):
    self.model_gain = params.get('model_gain')
    self.model_tc = params.get('model_tc')
    self.model_dt = params.get('model_dt')
    self.model_bias = params.get('model_bias')

    self.kp = params.get('kp')
    self.ki = params.get('ki')
    self.kd = params.get('kd')

    self.SP = params.get('sp')

    # self.minsize = 3600
    self.maxsize = 300 + 1
    self.noise = np.random.rand(self.maxsize) / 2
    self.noise -= 0.25
  # PID and Process Instantiation
    self.pid = PID_Controller()
    self.process_model = FOPDT_Model()
    self.sim_length = self.maxsize

    self.SP = np.zeros(self.maxsize)
    self.PV = np.zeros(self.maxsize)
    self.CV = np.zeros(self.maxsize)

    self.moment = 0

    # if(self.moment >= 300):
    #   return
    i = self.moment
    # Find the size of the range needed
    # calc_duration = int(self.model_dt * 2 + self.model_tc * 5)
    self.sim_length = self.maxsize -1

    # Defaults
    self.start_of_step = 10
    self.direction = "Direct" if self.model_gain > 0 else "Reverse"

    # Update Process model
    self.process_model.change_params((self.model_gain, self.model_tc, self.model_dt, self.model_bias))
    self.process_model.work_CV = self.CV
    # Get PID ready
    self.pid.tunings = (self.kp, self.ki, self.kd)
    self.pid.reset()
    # Set initial value
    # self.PV[0] = self.model_bias + self.noise[0]
    if(i == 0):
      self.PV[0] = self.model_bias

  def get(self):
    # try:
      # Loop through timestamps
      # for i in range(self.sim_length):
          # Adjust the Setpoint
      i = self.moment
      if i < self.start_of_step:
          self.SP[i] = self.model_bias
      elif self.direction == "Direct":
          self.SP[i] = 30 + self.model_bias if i < self.sim_length * 0.6 else 20 + self.model_bias
      else:
          self.SP[i] = -30 + self.model_bias if i < self.sim_length * 0.6 else -20 + self.model_bias
          # Find current controller output

      self.CV[i] = self.pid(self.PV[i], self.SP[i], self.direction)
          # Find calculated PV
      self.PV[i + 1] = self.process_model.update(self.PV[i], [i, i + 1])
      # self.PV[i + 1] += self.noise[i]

      data = {
        'moment': self.moment,
        'SP': round(self.SP[i], 2),
        'PV': round(self.PV[i], 2),
        'CV': round(self.CV[i], 2),
      }

      self.moment += 1

      return data 
          # Store individual terms
          # self.pterm[i], self.iterm[i], self.dterm[i] = self.pid.components
          # Calculate Integral Time weighted Average of the Error (ITAE)
          # self.itae = 0 if i < start_of_step else self.itae + (i - start_of_step) * abs(self.SP[i] - self.PV[i])
      # Update the plot
      
    # except Exception as e:
        # print(e)
        # messagebox.showerror("An Error Occurred", "Check Configuration: " + str(e))



if __name__ == "__main__":
    warnings.filterwarnings("ignore")
    params = {
        'model_gain': 2,
        'model_tc': 20.0,
        'model_dt': 5.0,
        'model_bias': 50.0,
        'kp': 2.0,
        'ki': 0.0,
        'kd': 0,
        'sp': 50,
    }
    sim = Simulator(params)
    sp = []
    pv = []
    cv = []
    for i in range(300):
      res = sim.get()
      sp.append(res.get('SP'))
      pv.append(res.get('PV'))
      cv.append(res.get('CV'))
    print('setpoint')
    print(sp)
    print('PV\n\n')
    print(pv)
    print('CV\n\n')
    print(cv)
    # print(sp[20])
    # print(pv[20])
    # print(cv[20])
    # print(len(pv))
    # print(sim.get())
    # print(sim.get())
    # print(sim.get())
    # plt.style.use("bmh")
    # gui = App()
    # gui.root.mainloop()