const generateSP = () => {
  const sp = []
  for (let i = 0; i < 300; i++) {
    sp.push({
      x: i,
      y: i < 30 ? 50 : 30
    })
  }
  return sp
}

const generatePV = () => {
  const pv = []
  for (let i = 0; i < 300; i++) {
    pv.push({
      x: i,
      y: 60
    })
  }
  return pv
}

const generateCV = () => {
  const cv = []
  for (let i = 0; i < 300; i++) {
    cv.push({
      x: i,
      y: 30
    })
  }
  return cv
}

var chart = null

window.onload = () => {
  let focusEl = 4
  $('body').keydown((e) => {
    const key = e.which
    if (key === 37) {//ESQUERDA
      $(`.tool${focusEl}`).removeClass('focusable')
      if(focusEl === 1) {
        focusEl = 8
      }
      $(`.tool${focusEl - 1}`).addClass('focusable')
      focusEl--
    }
    if (key === 39) {//DIREITA
      $(`.tool${focusEl}`).removeClass('focusable')
      if(focusEl === 7) {
        focusEl = 0
      }
      $(`.tool${focusEl + 1}`).addClass('focusable')
      focusEl++
    }
  })


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
    legend: {
      legendMarkerType: 'square'
    },
    data: [{
      type: 'line',
      color: '#4f81bc',
      name: 'SP - Set Point',
      showInLegend: true,
      legendMarkerType: 'square',
      dataPoints: generateSP()
    },
    {
      type: 'line',
      color: '#c0504e',
      name: 'PV - Variável de processo',
      showInLegend: true,
      legendMarkerType: 'square',
      dataPoints: generatePV()
    },
    {
      type: 'line',
      color: '#9bbb58',
      name: 'MV - Variável manipulada',
      showInLegend: true,
      legendMarkerType: 'square',
      dataPoints: generateCV()
    }]
  })
  chart.render()

  // var options = {

  // };
  // $("#chartContainer").CanvasJSChart(options);
}

// <!-- <script>
//   async function teste() {
//     let vt = await eel.initControler({
//       'model_gain': 2,
//       'model_tc': 20.0,
//       'model_dt': 5.0,
//       'model_bias': 50.0,
//       'kp': 2.0,
//       'ki': 0.0,
//       'kd': 0,
//       'sp': 50,
//     })()
//     console.log(vt)
//   }
//   async function plotar() {
//     const dataSP = []
//     const dataPV = []
//     const dataMV = []
//     for(let i = 0; i < 299; i++){
//       let vt = await eel.getControllerData(0)()
//       dataSP.push({
//         x: i,
//         y: vt['SP']
//       })
//       dataPV.push({
//         x: i,
//         y: vt['PV']
//       })
//       dataMV.push({
//         x: i,
//         y: vt['CV']
//       })
//     }
//     chart.options.data[0].dataPoints = dataSP
//     chart.options.data[1].dataPoints = dataPV
//     chart.options.data[2].dataPoints = dataMV
//     chart.render();
//     // chart.options.data[0].dataPoints[0] = dataSP
//   }
// </script>
// <button onclick="teste()">
//   criar
// </button>
// <button onclick="plotar()">
//   plotar
// </button> -->