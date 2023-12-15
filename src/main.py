import sys, io
import warnings
import eel
from eel import edge
import os
import subprocess as sps
from typing import List
from simulator import Simulator

PORT = 3345
VERSION = "0.0.6"


def showErrror(error: str):
    cmd = f"Add-Type -AssemblyName PresentationFramework;[System.Windows.MessageBox]::Show('{error}', 'Simux - Erro')"
    os.system(f'powershell -Command "{cmd}"')


def overrideEdgeRun(_path: str, options: any, start_urls: List[str]) -> None:
    try:
        cmd = "start msedge --new-window --disable-extensions --app={}".format(
            start_urls[0]
        )
        popen = sps.check_call(
            cmd, stdout=sys.stdout, stderr=sys.stderr, stdin=sps.PIPE, shell=True
        )
    except:
        showErrror("Erro ao abrir o navegador. Verifique se o Edge instá instalado")
        exit(1)


def getPositionOfWindow():
    cmd = "wmic path Win32_VideoController get CurrentVerticalResolution,CurrentHorizontalResolution"
    size_tuple = tuple(map(int, os.popen(cmd).read().split()[-2::]))
    screen_width, screen_height = size_tuple
    x = (screen_width - 1416) // 2
    y = (screen_height - 832) // 2
    return x, y


def checkIfPortIsUsed(port: int):
    import socket

    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        sk = s.connect_ex(("localhost", port))
        if sk != 0:
            s.close()
        return sk == 0


edge.run = overrideEdgeRun

controller = None


@eel.expose
def initControler(controllerData):
    global controller
    controller = Simulator(controllerData)
    return controller


@eel.expose
def destroyController():
    global controller
    controller = None


@eel.expose
def controllerPulse():
    return controller.pulse()


@eel.expose
def setSP(newSP):
    return controller.setSP(newSP)


@eel.expose
def setKp(newKP):
    return controller.setKp(newKP)


@eel.expose
def setKi(newKI):
    return controller.setKi(newKI)


@eel.expose
def setKd(newKD):
    return controller.setKd(newKD)


@eel.expose
def setBias(newBias):
    return controller.setBias(newBias)


@eel.expose
def setNoise(minNoise, maxNoise):
    return controller.setNoise(minNoise, maxNoise)


if __name__ == "__main__":
    warnings.filterwarnings("ignore")

    if checkIfPortIsUsed(PORT):
        errorMsg = "O simux já está rodando ou a porta {} já está aberta".format(PORT)
        print(errorMsg)
        showErrror(errorMsg)
        exit(1)

    is_nuitka = "__compiled__" in globals()
    if is_nuitka:
        folder = os.path.join(os.environ["TEMP"], "simux-temp") + "\\gui"
        eel.init(folder)
    else:
        eel.init("./gui")

    eel.start(
        ("main.html?version=" + VERSION),
        port=PORT,
        mode="edge",
        size=(1416, 832),
        position=(getPositionOfWindow()),
    )
