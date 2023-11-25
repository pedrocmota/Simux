import sys, io
import warnings
from simulator import Simulator

if getattr(sys, 'frozen', False) and hasattr(sys, '_MEIPASS'):
  buffer = io.StringIO()
  sys.stdout = sys.stderr = buffer

import eel

controllersArray = []

@eel.expose
def initControler(controllerData):
  sim = Simulator(controllerData)
  controllersArray.append(sim)
  controllerID = len(controllersArray) - 1
  return controllerID

@eel.expose
def getControllerData(controllerID):
  return controllersArray[controllerID].get()

if __name__ == "__main__":
  warnings.filterwarnings("ignore")
  eel.init('gui')

  eel.start('main.html',
    size=(1480, 984)
  )