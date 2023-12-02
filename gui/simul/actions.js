let intervalId

const toggleStatus = () => {
  if (data.status === 'running') {
    pause()
  } else {
    resume()
  }
}

const pause = () => {
  $('.current_status').text('PAUSADO')
  $('.time_status').text('CONTINUAR')
  $('.current_status').removeClass('status_running')
  $('.current_status').addClass('status_paused')
  data.status = 'paused'
  clearInterval(intervalId)
}

const resume = () => {
  if(data.moment < 1800) {
    $('.current_status').text('EXECUTANDO')
    $('.time_status').text('PAUSAR')
    $('.current_status').removeClass('status_paused')
    $('.current_status').addClass('status_running')
    data.status = 'running'
    intervalId = setInterval(pulseController, 1000 / data.currentSpeedLevel)
  }
}

const setScale = (scaleNumber) => {
  $('.scales').removeClass('active')
  $(`#scale-${scaleNumber}`).addClass('active')
  if(scaleNumber === 1) {
    chart.options.axisX.minimum = 0
    chart.options.axisX.maximum = 300
    chart.render()
  }
  if(scaleNumber === 2) {
    chart.options.axisX.minimum = 300
    chart.options.axisX.maximum = 600
    chart.render()
  }
  if(scaleNumber === 3) {
    chart.options.axisX.minimum = 600
    chart.options.axisX.maximum = 900
    chart.render()
  }
  if(scaleNumber === 4) {
    chart.options.axisX.minimum = 900
    chart.options.axisX.maximum = 1200
    chart.render()
  }
  if(scaleNumber === 5) {
    chart.options.axisX.minimum = 1200
    chart.options.axisX.maximum = 1500
    chart.render()
  }
  if(scaleNumber === 6) {
    chart.options.axisX.minimum = 1500
    chart.options.axisX.maximum = 1800
    chart.render()
  }
}

const setSpeed = (speed) => {
  clearInterval(intervalId)
  data.currentSpeedLevel = speed
  if(data.status === 'running') {
    intervalId = setInterval(pulseController, 1000 / data.currentSpeedLevel)
  }
}

const setSP = async (newSP) => {
  if(!IS_DEV) {
    await eel.setSP(data.controllerID, newSP)()
  }
}

const setKp = async (newKp) => {
  data.formData.kp = newKp
  if(!IS_DEV) {
    await eel.setKp(data.controllerID, newKp)()
  }
}

const setKi = async (newKi) => {
  data.formData.ki = newKi
  if(!IS_DEV) {
    await eel.setKi(data.controllerID, newKi)()
  }
}

const setKd = async (newKd) => {
  data.formData.kd = newKd
  if(!IS_DEV) {
    await eel.setKd(data.controllerID, newKd)()
  }
}

const pulseController = async () => {
  if(!IS_DEV) {
    let vt = await eel.getControllerData(data.controllerID)()
    data.moment = vt['moment']
    data.currentData.sp = vt['SP']
    data.currentData.pv = vt['PV']
    data.currentData.cv = vt['CV']
    if(data.moment === 0) {
      spData = []
      pvData = []
      cvData = []
      chart.toolTip.set('enabled', true)
    }

    spData.push({
      x: data.moment,
      y: data.currentData.sp
    })
    pvData.push({
      x: data.moment,
      y: data.currentData.pv
    })
    cvData.push({
      x: data.moment,
      y: data.currentData.cv
    })
    chart.options.data[0].dataPoints = spData
    chart.options.data[1].dataPoints = pvData
    chart.options.data[2].dataPoints = cvData
    chart.render()

    $('.current_time').text(`${data.moment}s`)
    $('.pv_value').text(`${data.currentData.pv}%`)
    $('.mv_value').text(`${data.currentData.cv}%`)
  }

}

// TEMP GENERATE

async function plotar() {
  const dataSP = []
  const dataPV = []
  const dataMV = []
  chart.toolTip.set('enabled', true)
  for(let i = 0; i <= 300; i++){
    let vt = await eel.getControllerData(0)()
    dataSP.push({
      x: i,
      y: vt['SP']
    })
    dataPV.push({
      x: i,
      y: vt['PV']
    })
    dataMV.push({
      x: i,
      y: vt['CV']
    })
    if(i === 10) {
      await eel.setSP(0,80)()
    }
    if(i === 180) {
      await eel.setSP(0,70)()
    }
    // if(i === 140) {
    //   await eel.setKi(0,0.1)()
    // }
    chart.options.data[0].dataPoints = dataSP
    chart.options.data[1].dataPoints = dataPV
    chart.options.data[2].dataPoints = dataMV
    chart.render()
  }
}