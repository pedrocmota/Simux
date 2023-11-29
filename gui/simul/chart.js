let chart = null

const generateChart = () => {
  chart = new CanvasJS.Chart('chartContainer', {
    theme: 'dark1',
    backgroundColor: '#282a36',
    exportEnabled: false,
    animationEnabled: false,
    axisX: {
      minimum: 0,
      maximum: 300,
      interval: 20,
      labelFontSize: 16,
      titleFontSize: 20,
      gridThickness: 1,
      gridColor: '#444242',
      labelFormatter: function (e) {
        return e.value + 's'
      }
    },
    axisY: {
      titleFontSize: 20,
      minimum: 0,
      maximum: 100,
      interval: 20,
      labelFontSize: 16,
      labelFormatter: function (e) {
        return e.value + '%'
      },
      gridThickness: 1,
      gridColor: '#444242'
    },
    toolTip: {
      enabled: false,
      contentFormatter: (values) => `
        <div style="padding:10px">
        <p style="font-size: 18px">Momento: <b>${values.entries[0].dataPoint.x}</b>s</p>
        <hr>
        <p style="font-size: 16px">Valor do SP: <b>${values.entries[0].dataPoint.y}</b>%</p>
        <p style="font-size: 16px">Valor do PV: <b>${values.entries[1].dataPoint.y}</b>%</p>
        <p style="font-size: 16px">Valor do CV: <b>${values.entries[2].dataPoint.y}</b>%</p>
        </div>
        `,
      shared: true,
      backgroundColor: '#282a36',
      fontColor: '#f8f8f2',
      borderColor: '#787C8F'
    },
    data: [{
      type: 'line',
      color: '#4f81bc',
      name: 'SP - Set Point',
      showInLegend: true,
      dataPoints: [{x:-1,y:-1}]
    },
    {
      type: 'line',
      color: '#c0504e',
      name: 'PV - Variável de processo',
      showInLegend: true,
      dataPoints: [{x:-1,y:-1}]
    },
    {
      type: 'line',
      color: '#9bbb58',
      name: 'MV - Variável manipulada',
      showInLegend: true,
      dataPoints: [{x:-1,y:-1}]
    }]
  })
  chart.render()
}

async function teste() {
  let vt = await eel.initControler({
    controller_action: 'Direct',
    model_gain: 2,
    model_tc: 20.0,
    model_dt: 5.0,
    model_bias: 50.0,
    model_noise_min: 0,
    model_noise_max: 0.1,
    kp: 2.0,
    ki: 0.0,
    kd: 0.0,
    initSP: 50
  })()
}
async function plotar() {
  const dataSP = []
  const dataPV = []
  const dataMV = []
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
    if(i === 140) {
      await eel.setKI(0,0.1)()
    }
  }
  chart.options.data[0].dataPoints = dataSP
  chart.options.data[1].dataPoints = dataPV
  chart.options.data[2].dataPoints = dataMV
  chart.render()
}