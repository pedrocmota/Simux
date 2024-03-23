const initPopups = () => {
  $('#kp').inputmask('numeric', {
    min: 0.1,
    max: 10,
    digits: 1,
    clearMaskOnLostFocus: false
  })
  $('#ki').inputmask('numeric', {
    min: 0,
    max: 5,
    digits: 2,
    digitsOptional: true,
    clearMaskOnLostFocus: false
  })
  $('#kd').inputmask('numeric', {
    min: 0,
    max: 30,
    digits: 2,
    digitsOptional: true,
    clearMaskOnLostFocus: false
  })
  $('#simulation_input').inputmask('numeric', {
    min: 0,
    max: 1800,
    digits: 0
  })
  $('#hs').inputmask('numeric', {
    min: 0,
    max: 90,
    digits: 1,
    clearMaskOnLostFocus: false
  })

  $('#save_constants').on('click', () => {
    if (data.status !== 'finished') {
      if(data.formData.controller_type === 'PID') {
        const kp = parseFloat($('#kp').val() || 0)
        const ki = parseFloat($('#ki').val() || 0)
        const kd = parseFloat($('#kd').val() || 0)
        let changedKp = false
        let changedKi = false
        let changedKd = false
  
        if (kp !== data.formData.kp) {
          setKp(kp)
          changedKp = true
        }
        if (ki !== data.formData.ki) {
          setKi(ki)
          changedKi = true
        }
        if (kd !== data.formData.kd) {
          setKd(kd)
          changedKd = true
        }
  
        if (changedKp) {
          generateToast(`Kp alterado para ${kp}.`)
        }
        if (changedKi) {
          generateToast(`Ki alterado para ${ki}.`)
        }
        if (changedKd) {
          generateToast(`Kd alterado para ${kd}.`)
        }
      }
      if(data.formData.controller_type === 'ON/OFF') {
        const hs = parseFloat($('#hs').val() || 0)
        let changedHs = false
  
        if (hs !== data.formData.initialHS) {
          setHS(hs)
          changedHs = true
        }
  
        if (changedHs) {
          generateToast(`Histerese alterada para ${hs}.`)
        }
      }
    }
  })

  $('#save_bias').on('click', () => {
    if (data.status !== 'finished') {
      const bias = parseFloat($('#bias_input').val() || 0)
      const slider = $('#noise').data('ionRangeSlider')
      const minNoise = slider.result.from
      const maxNoise = slider.result.to

      let changedBias = false
      let changedNoise = false

      if (bias !== data.formData.model_bias) {
        setBias(bias)
        changedBias = true
      }
      if ((minNoise !== data.formData.model_noise_min) || (maxNoise !== data.formData.model_noise_max)) {
        setNoise(minNoise, maxNoise)
        changedNoise = true
      }

      if (changedBias) {
        generateToast(`Bias alterado para ${bias}%.`)
      }
      if (changedNoise) {
        generateToast('Ruído alterado.')
      }
    }
  })

  if(data.formData.controller_type === 'ON/OFF') {
    $('.kp_form').attr('style', 'display:none !important')
    $('.ki_form').attr('style', 'display:none !important')
    $('.kd_form').attr('style', 'display:none !important')
    $('.bias_form').attr('style', 'display:none !important')
    $('.hs_form').show()

    $('.label_noise').removeAttr('style')
    $('.noise_form').addClass('mt-2')
  }

  $.ui.dialog.prototype._focusTabbable = () => { }
}

const openPopupConstants = () => {
  $('#popup_constants').dialog({
    title: 'Constantes',
    width: 340,
    modal: true,
    resizable: false,
    open: () => {
      $('#kp').focus()
    },
    close: () => {
      $(`.tool${focusEl}`).focus()
    }
  })
  $('#kp').val(data.formData.kp)
  $('#ki').val(data.formData.ki)
  $('#kd').val(data.formData.kd)
  $('#hs').val(data.formData.initialHS)

  $('#model_loop').text(data.formData.loop === 'OPEN' ? 'Aberta' : 'Fechada')
  $('#controller_type').text(data.formData.controller_type === 'PID' ? 'PID' : 'ON/OFF')
  $('#controller_mode').text(data.formData.mode === 'AUTOMATIC' ? 'Automático' : 'Manual')
  $('#model_action').text(data.formData.controller_action === 'DIRECT' ? 'Direta' : 'Reversa')
  $('#bias_input').val(data.formData.model_bias)
  $('#model_gain').text(data.formData.model_gain)
  $('#model_tc').text(`${data.formData.model_tc}s`)
  $('#model_dt').text(`${data.formData.model_dt}s`)
  $('#model_bias').text(`${data.formData.model_bias}%`)
  $('#model_noise_min').text(`${data.formData.model_noise_min}%`)
  $('#model_noise_max').text(`${data.formData.model_noise_max}%`)

  $('#model_kp').text(`${data.formData.kp}”`)
  if (data.formData.ki === 0) {
    $('#model_ki').text('0”')
  } else {
    $('#model_ki').text(`${data.formData.ki}”`)
  }
  if (data.formData.kd === 0) {
    $('#model_kd').text('0”')
  } else {
    $('#model_kd').text(`${data.formData.kd}”`)
  }

  $('#bias_input').inputmask('numeric', {
    min: 0,
    max: 80,
    digits: 1,
    clearMaskOnLostFocus: false
  })
  $('#noise').ionRangeSlider({
    type: 'double',
    min: 0,
    max: 1,
    step: 0.010,
    from: data.formData.model_noise_min,
    to: data.formData.model_noise_max,
    grid: false,
    onChange: (data) => {
      if (data.from == 0 && data.to == 0) {
        $('#help_noise').text('Ruído desabilitado')
      } else {
        $('#help_noise').text(`Ruído entre ${data.from} e ${data.to}%, para mais ou para menos.`)
      }
    }
  })

  if (data.formData.model_noise_min == 0 && data.formData.model_noise_max == 0) {
    $('#help_noise').text('Ruído desabilitado')
  } else {
    $('#help_noise').text(`Ruído entre ${data.formData.model_noise_min} e ${data.formData.model_noise_max}%, para mais ou para menos.`)
  }
}

const openPopupActions = () => {
  $('#popup_commands').dialog({
    title: 'Ações',
    modal: true,
    width: 338,
    resizable: false,
    classes: {
      'ui-dialog': 'popup_shortcuts ui-corner-all ui-widget'
    },
    open: () => {
      // ATALHO PARA MUDAR VELOCIDADE
      $('.speed_up').on('click', () => {
        if (data.currentSpeed < 3) {
          setSpeed(data.currentSpeed + 1)
        }
      })
      $('.speed_down').on('click', () => {
        if (data.currentSpeed > 1) {
          setSpeed(data.currentSpeed - 1)
        }
      })
      $('.popup_shortcuts > .ui-dialog-titlebar > .ui-dialog-titlebar-close').focus()
    },
    close: () => {
      $(`.tool${focusEl}`).focus()
    }
  })
}

const openPopupShortcuts = () => {
  $('#popup_shortcuts').dialog({
    title: 'Mapa de atalhos',
    modal: true,
    width: 470,
    height: 500,
    resizable: false,
    classes: {
      'ui-dialog': 'popup_shortcuts ui-corner-all ui-widget'
    },
    open: () => {
      $('.popup_shortcuts > .ui-dialog-titlebar > .ui-dialog-titlebar-close').focus()
    },
    close: () => {
      $(`.tool${focusEl}`).focus()
    }
  })
}

const openPopupExit = () => {
  $('#dialog-confirm').dialog({
    resizable: false,
    height: 'auto',
    width: 400,
    modal: true,
    open: () => {
      $('.btn-keep').focus()
      $('.btn-keep').keydown((e) => {
        if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
          $('.btn-exit').focus()
        }
      })
      $('.btn-exit').keydown((e) => {
        if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
          $('.btn-keep').focus()
        }
      })
    },
    close: () => {
      $('.btn-keep').off('keydown')
      $('.btn-exit').off('keydown')
      $(`.tool${focusEl}`).focus()
    },
    buttons: [
      {
        text: 'Quero continuar',
        class: 'btn btn-secondary btn-keep focus_priority',
        click: () => {
          $('#dialog-confirm').dialog('close')
        }
      },
      {
        text: 'Quero sair',
        class: 'btn btn-danger btn-exit focus_priority',
        click: async () => {
          await eel.destroyController()()
          window.location.href = '../main.html'
        }
      }
    ]
  })
}