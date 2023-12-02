import sys, io
import warnings
from simulator import Simulator
import eel
import os

PORT = 3345
VERSION = "1.0"

controllersArray = []


@eel.expose
def initControler(controllerData):
    sim = Simulator(controllerData)
    controllersArray.append(sim)
    controllerID = len(controllersArray) - 1
    return controllerID


@eel.expose
def destroyController(controllerID):
    controllersArray.pop(controllerID)


@eel.expose
def getControllerData(controllerID):
    return controllersArray[controllerID].get()


@eel.expose
def setSP(controllerID, newSP):
    return controllersArray[controllerID].setSP(newSP)


@eel.expose
def setKp(controllerID, newKP):
    return controllersArray[controllerID].setKp(newKP)


@eel.expose
def setKi(controllerID, newKI):
    return controllersArray[controllerID].setKi(newKI)


@eel.expose
def setKd(controllerID, newKD):
    return controllersArray[controllerID].setKd(newKD)


if __name__ == "__main__":
    warnings.filterwarnings("ignore")

    is_nuitka = "__compiled__" in globals()
    if is_nuitka:
        folder = os.path.join(os.environ["TEMP"], "simux-temp") + "\\gui"
        eel.init(folder)
    else:
        eel.init("./gui")

    eel.start("main.html?version=" + VERSION, port=PORT)
