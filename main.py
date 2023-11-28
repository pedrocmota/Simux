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

@eel.expose
def setSP(controllerID, newSP):
  return controllersArray[controllerID].setSP(newSP)

@eel.expose
def setKP(controllerID, newKP):
  return controllersArray[controllerID].setKP(newKP)

@eel.expose
def setKI(controllerID, newKI):
  return controllersArray[controllerID].setKI(newKI)

@eel.expose
def setKD(controllerID, newKD):
  return controllersArray[controllerID].setKD(newKD)

if __name__ == "__main__":
  warnings.filterwarnings("ignore")
  eel.init('gui')

  eel.start('main.html',
    # size=(1480, 984),
    port=3345
  )