const initPopups = () => {
  $('#kp').inputmask('numeric', {
    min: 0.1,
    max: 5,
    clearMaskOnLostFocus: false
  })
  $('#ki').inputmask('numeric', {
    min: 0,
    max: 30,
    clearMaskOnLostFocus: false
  })
  $('#kd').inputmask('numeric', {
    min: 0,
    max: 30,
    clearMaskOnLostFocus: false
  })
  $('#simulation_input').inputmask('numeric', {
    min: 0,
    max: 1800,
    digits: 0
  })

  $('#save_constants').on('click', () => {
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
      generateToast(`Kp alterado para ${kp}`)
    }
    if (changedKi) {
      generateToast(`Ki alterado para ${ki}`)
    }
    if (changedKd) {
      generateToast(`Kd alterado para ${kd}`)
    }
  })
  $.ui.dialog.prototype._focusTabbable = () => { }
}

const openPopupConstants = () => {
  $('#popup_constants').dialog({
    title: 'Constantes',
    width: 320,
    height: 'auto',
    minHeight: 380,
    modal: true,
    resizable: false,
    open: () => {
      $('#kp').focus()
    }
  })
  $('#kp').val(data.formData.kp)
  $('#ki').val(data.formData.ki)
  $('#kd').val(data.formData.kd)

  $('#model_gain').text(data.formData.model_gain)
  $('#model_tc').text(`${data.formData.model_tc}s`)
  $('#model_dt').text(`${data.formData.model_dt}s`)
  $('#model_bias').text(`${data.formData.model_bias}%`)
  $('#model_noise_min').text(`${data.formData.model_noise_min}%`)
  $('#model_noise_max').text(`${data.formData.model_noise_max}%`)
}

const openPopupActions = () => {
  $('#popup_commands').dialog({
    title: 'Ações',
    modal: true,
    width: 320,
    height: 650,
    resizable: false,
    classes: {
      'ui-dialog': 'popup_shortcuts'
    },
    open: () => {
      $('.popup_shortcuts > .ui-dialog-titlebar > .ui-dialog-titlebar-close').focus()
    }
  })
}

const openPopupShortcuts = () => {
  $('#popup_shortcuts').dialog({
    title: 'Mapa de atalhos',
    modal: true,
    width: 450,
    height: 500,
    resizable: false,
    classes: {
      'ui-dialog': 'popup_shortcuts'
    },
    open: () => {
      $('.popup_shortcuts > .ui-dialog-titlebar > .ui-dialog-titlebar-close').focus()
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
    },
    buttons: [
      {
        text: 'Quero continuar',
        class: 'btn btn-secondary btn-keep',
        click: () => {
          $('#dialog-confirm').dialog('close')
        }
      },
      {
        text: 'Quero sair',
        class: 'btn btn-danger',
        click: async () => {
          await eel.destroyController(data.controllerID)()
          window.location.href = '../main.html'
        }
      }
    ]
  })
}