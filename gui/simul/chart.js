var chart = null
var spData = [{}]
var pvData = [{}]
var mvData = [{}]

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
      labelFormatter: (e) => {
        if (e.value < 999) {
          return '\u2800' + e.value + 's'
        } else {
          return e.value + 's'
        }
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
        <p style="font-size: 16px">Valor da VP: <b>${values.entries[1].dataPoint.y}</b>%</p>
        <p style="font-size: 16px">Valor da MV: <b>${values.entries[2].dataPoint.y}</b>%</p>
        <hr/>
        <p style="font-size: 16px">Desvio: <b>${(values.entries[1].dataPoint.y - values.entries[0].dataPoint.y).toFixed(1)}</b>%</p>
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
      dataPoints: spData,
      markerSize: 0
    },
    {
      type: 'line',
      color: '#c0504e',
      name: 'PV - Variável de processo',
      showInLegend: true,
      dataPoints: pvData,
      markerSize: 0
    },
    {
      type: 'line',
      color: '#9bbb58',
      name: 'MV - Variável manipulada',
      showInLegend: true,
      dataPoints: mvData,
      markerSize: 0
    }]
  })
  chart.render()
}