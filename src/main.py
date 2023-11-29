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

    is_nuitka = "__compiled__" in globals()
    if is_nuitka:
        folder = os.path.join(os.environ["TEMP"], "simux-temp") + "\\gui"
        eel.init(folder)
    else:
        eel.init("./gui")

    eel.start("main.html?version=" + VERSION, port=PORT)