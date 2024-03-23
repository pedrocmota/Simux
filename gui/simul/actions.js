let intervalId

const toggleStatus = () => {
  if (data.status === 'running') {
    pause()
  } else {
    resume()
  }
}

const pause = () => {
  if (data.status !== 'finished') {
    $('.current_status').text('PAUSADO')
    $('.current_status').removeClass('status_running')
    $('.current_status').addClass('status_paused')
    data.status = 'paused'
    clearInterval(intervalId)
  }
}

const resume = () => {
  if (data.status !== 'finished') {
    $('.current_status').text('EXECUTANDO')
    $('.current_status').removeClass('status_paused')
    $('.current_status').addClass('status_running')
    data.status = 'running'
    intervalId = setInterval(pulseController, 1000 / data.currentSpeed)
  }
}

const finish = () => {
  $('.current_status').text('FINALIZADO')
  $('.current_status').removeClass('status_paused status_running')
  $('.current_status').addClass('status_finished')
  data.status = 'finished'
  clearInterval(intervalId)
}

const setScale = (scaleNumber) => {
  $('.scales').removeClass('active')
  $(`#scale-${scaleNumber}`).addClass('active')
  if (scaleNumber === 1) {
    chart.options.axisX.minimum = 0
    chart.options.axisX.maximum = 300
    data.currentScale = 1
    chart.render()
  }
  if (scaleNumber === 2) {
    chart.options.axisX.minimum = 300
    chart.options.axisX.maximum = 600
    data.currentScale = 2
    chart.render()
  }
  if (scaleNumber === 3) {
    chart.options.axisX.minimum = 600
    chart.options.axisX.maximum = 900
    data.currentScale = 3
    chart.render()
  }
  if (scaleNumber === 4) {
    chart.options.axisX.minimum = 900
    chart.options.axisX.maximum = 1200
    data.currentScale = 4
    chart.render()
  }
  if (scaleNumber === 5) {
    chart.options.axisX.minimum = 1200
    chart.options.axisX.maximum = 1500
    data.currentScale = 5
    chart.render()
  }
  if (scaleNumber === 6) {
    chart.options.axisX.minimum = 1500
    chart.options.axisX.maximum = 1800
    data.currentScale = 6
    chart.render()
  }
}

const setSpeed = (speed) => {
  if (data.status !== 'finished') {
    $('.current_speed').text(`Velocidade: ${speed}x`)
    data.currentSpeed = speed
    generateToast(`Velocidade alterada para ${data.currentSpeed}x.`)

    if (data.currentSpeed === 3) {
      $('.speed_up').prop('disabled', true)
    }
    if (data.currentSpeed === 1) {
      $('.speed_down').prop('disabled', true)
    }
    if (data.currentSpeed !== 3) {
      $('.speed_up').prop('disabled', false)
    }
    if (data.currentSpeed !== 1) {
      $('.speed_down').prop('disabled', false)
    }

    clearInterval(intervalId)
    if (data.status === 'running') {
      intervalId = setInterval(pulseController, 1000 / data.currentSpeed)
    }
  }
}

const setSP = async (newSP) => {
  if (!IS_DEV) {
    await eel.setSP(newSP)()
  }
}

const setMV = async (newMV) => {
  if (!IS_DEV) {
    await eel.setMV(newMV - data.formData.model_bias)()
  }
}

const setPV = async (newPV) => {
  if (!IS_DEV) {
    await eel.setPV(newPV)()
  }
}

const setKp = async (newKp) => {
  data.formData.kp = newKp
  $('#model_kp').text(`${newKp}”`)
  if (!IS_DEV) {
    await eel.setKp(newKp)()
  }
}

const setKi = async (newKi) => {
  data.formData.ki = newKi
  if (newKi === 0) {
    $('#model_ki').text('0”')
  } else {
    $('#model_ki').text(`${newKi}”`)
  }
  if (!IS_DEV) {
    await eel.setKi(newKi)()
  }
}

const setKd = async (newKd) => {
  data.formData.kd = newKd
  if (newKd === 0) {
    $('#model_kd').text('0”')
  } else {
    $('#model_kd').text(`${newKd}”`)
  }
  if (!IS_DEV) {
    await eel.setKd(newKd)()
  }
}

const setBias = async (newBias) => {
  data.formData.bias = newBias
  $('#model_bias').text(`${newBias}%`)
  if (!IS_DEV) {
    await eel.setBias(newBias)()
  }
}

const setNoise = async (newMinNoise, newMaxNoise) => {
  data.formData.model_noise_min = newMinNoise
  data.formData.model_noise_max = newMaxNoise
  $('#model_noise_min').text(`${newMinNoise}%`)
  $('#model_noise_max').text(`${newMaxNoise}%`)
  if (!IS_DEV) {
    await eel.setNoise(newMinNoise, newMaxNoise)()
  }
}

const setMode = async (newMode) => {
  if (data.formData.loop === 'OPEN') {
    generateToast('Não é possível deixar em modo manual com malha aberta.')
    return
  }
  const oldMode = data.formData.mode
  data.formData.mode = newMode
  if (newMode === 'AUTOMATIC' && oldMode !== 'AUTOMATIC') {
    $('.loop_manual').addClass('btn-secondary')
    $('.loop_manual').removeClass('btn-primary')
    $('.loop_automatic').addClass('btn-primary')
    $('.loop_automatic').removeClass('btn-secondary')

    $('.mode').text('MODO AUTOMÁTICO')
    $('.mode').removeClass('mode_manual')
    $('#controller_mode').text(data.formData.mode === 'AUTOMATIC' ? 'Auto' : 'Manual')

    generateToast('Controlador alterado para automático.')
  }
  if (newMode === 'MANUAL' && oldMode !== 'MANUAL') {
    $('.loop_automatic').addClass('btn-secondary')
    $('.loop_automatic').removeClass('btn-primary')
    $('.loop_manual').addClass('btn-primary')
    $('.loop_manual').removeClass('btn-secondary')

    $('.mode').text('MODO MANUAL')
    $('.mode').addClass('mode_manual')
    $('#controller_mode').text(data.formData.mode === 'AUTOMATIC' ? 'Auto' : 'Manual')

    generateToast('Controlador alterado para manual.')
  }

  if (!IS_DEV) {
    await eel.setMode(newMode)()
  }
}

const setLoop = async (newLoop) => {
  if (data.formData.mode === 'MANUAL') {
    generateToast('Não é possível abrir a malha em modo manual.')
    return
  }
  const oldLoop = data.formData.loop
  data.formData.loop = newLoop
  if (newLoop === 'CLOSED' && oldLoop !== 'CLOSED') {
    $('.loop_open').addClass('btn-secondary')
    $('.loop_open').removeClass('btn-primary')
    $('.loop_closed').addClass('btn-primary')
    $('.loop_closed').removeClass('btn-secondary')
    $('#model_loop').text(data.formData.loop === 'OPEN' ? 'Aberta' : 'Fechada')
    generateToast('Malha alterada para fechada.')
  }

  if (newLoop === 'OPEN' && oldLoop !== 'OPEN') {
    $('.loop_closed').addClass('btn-secondary')
    $('.loop_closed').removeClass('btn-primary')
    $('.loop_open').addClass('btn-primary')
    $('.loop_open').removeClass('btn-secondary')
    $('#model_loop').text(data.formData.loop === 'OPEN' ? 'Aberta' : 'Fechada')
    generateToast('Malha alterada para aberta.')
  }

  if (!IS_DEV) {
    await eel.setLoop(newLoop)()
  }
}

const pulseController = async (disableRender = false) => {
  if (!IS_DEV) {
    if (data.moment === 1800) {
      return finish()
    }
    let vt = await eel.controllerPulse()()
    data.moment = vt['moment']
    data.currentData.sp = vt['SP']
    data.currentData.pv = vt['PV']
    data.currentData.mv = vt['MV']
    if (data.moment === 0) {
      spData = []
      pvData = []
      mvData = []
      chart.toolTip.set('enabled', true)
    }

    if (data.moment === 300) {
      setScale(2)
    }
    if (data.moment === 600) {
      setScale(3)
    }
    if (data.moment === 900) {
      setScale(4)
    }
    if (data.moment === 1200) {
      setScale(5)
    }
    if (data.moment === 1500) {
      setScale(6)
    }

    spData.push({
      x: data.moment,
      y: data.currentData.sp
    })
    pvData.push({
      x: data.moment,
      y: data.currentData.pv
    })
    mvData.push({
      x: data.moment,
      y: data.currentData.mv
    })

    if (!disableRender) {
      pulseRender()
    }
  }
}

const pulseRender = () => {
  chart.options.data[0].dataPoints = spData
  chart.options.data[1].dataPoints = pvData
  chart.options.data[2].dataPoints = mvData
  chart.render()

  $('.current_time').text(`${data.moment}s`)
  if (!data.selecting.pv) {
    $('.pv_input').val(`${data.currentData.pv}%`)
  }
  if (!data.selecting.mv) {
    $('.mv_input').val(`${data.currentData.mv}%`)
  }
}

const simulateUntil = async () => {
  const max = parseInt($('#simulation_input').val())
  if (max <= data.moment) {
    return generateToast('Esse momento já foi simulado.')
  }
  for (i = data.moment; i <= max; i++) {
    await pulseController(true)
  }
  pulseRender()
}