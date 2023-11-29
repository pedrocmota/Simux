const startShortcut = () => {
  // MUDANÇA DE FOCO ENTRE AS TOOLBOXES
  // 
  let focusEl = 4
  $('body').keydown((e) => {
    const key = e.which
    if (key === 37) {//ESQUERDA
      if (focusEl === 1) {
        focusEl = 8
      }
      $(`.tool${focusEl - 1}`).focus()
      focusEl--
    }
    if (key === 39) {//DIREITA
      if (focusEl === 7) {
        focusEl = 0
      }
      $(`.tool${focusEl + 1}`).focus()
      focusEl++
    }
  })

  $('.main_box').focus()

  // AÇÃO PAUSAR/CONTINUAR
  $('.sp_input').keypress(function (e) {
    if (String.fromCharCode(e.keyCode).match(/[^0-9]/g)) return false
  })

  const action_pause = () => {
    toggleStatus()
    focusEl = 4
  }
  $('.main_box').on('click', action_pause)
  $('.main_box').on('keypress', (e) => {if (e.which === 13) {action_pause()} })


  // AÇÃO MUDANÇA SETPOINT
  let sp_selecting = false
  const action_setpoint = () => {
    if (sp_selecting == false) {
      $('.sp_input').attr('disabled', false)
      $('.sp_input').addClass('sp_input_selected')
      $('.sp_input').val('')
      $('.sp_input').focus()
      focusEl = 1
      sp_selecting = true
    }
  }
  const action_setpoint_cancel = () => {
    $('.sp_box').focus()
    $('.sp_input').attr('disabled', true)
    $('.sp_input').removeClass('sp_input_selected')
    $('.sp_input').val(`${data.currentData.sp}%`)
    focusEl = 1
    setTimeout(() => {
      sp_selecting = false
      focusEl = 1
    }, 200)
  }

  const action_setpoint_change = () => {
    const value = $('.sp_input').val()
    const sp = parseInt(value.replace('%', ''))
    if (sp >= 5 && sp <= 90) {
      data.currentData.sp = sp
      $('.sp_input').val(`${data.currentData.sp}%`)

      $.toast({
        text: 'Set Point atualizado',
        bgColor: '#444444',
        textColor: '#eeeeee',
        showHideTransition: 'fade',
        allowToastClose: true,
        hideAfter: 2000,
        stack: 5,
        position: 'top-right',
  
  
        textAlign: 'left',
        loader: false
      })

      action_setpoint_cancel()
    }
  }
  $('.sp_box').on('keydown', (e) => {
    if (e.which === 13) {
      action_setpoint()
    }
  })
  $('.sp_input').on('keydown', (e) => {
    if (e.which === 27 && sp_selecting) {
      action_setpoint_cancel()
    }
    if (e.which === 13 && sp_selecting) {
      action_setpoint_change()
    }
  })
  $('.sp_box').on('focusout', (event) => {
    if (!$('.sp_box').has(event.relatedTarget).length) {
      if (sp_selecting) {
        action_setpoint_cancel()
      }
    }
  })
}