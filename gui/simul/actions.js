const toggleStatus = () => {
  if (data.status === 'running') {
    pause()
  } else {
    resume()
  }
}

const pause = () => {
  $('.current_status').text('PAUSADO')
  $('.current_status').removeClass('status_running')
  $('.current_status').addClass('status_paused')
  data.status = 'paused'
}

const resume = () => {
  $('.current_status').text('EXECUTANDO')
  $('.current_status').removeClass('status_paused')
  $('.current_status').addClass('status_running')
  data.status = 'running'
}

const setStep = (step) => {

}

const setSpeed = (speed) => {

}