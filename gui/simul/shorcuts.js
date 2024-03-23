let focusEl = 4

const startShortcut = () => {
  // MUDANÇA DE FOCO ENTRE AS TOOLBOXES
  // 
  $('body').keydown((e) => {
    const active = $(document.activeElement)
    if (active !== null && active.hasClass('focus_priority')) {
      return
    }
    if (!e.ctrlKey && !e.altKey && !e.shiftKey) {
      if (e.key === 'ArrowLeft') {
        if (focusEl === 1) {
          focusEl = 8
        }
        $(`.tool${focusEl - 1}`).focus()
        focusEl--
      }
      if (e.key === 'ArrowRight') {
        if (focusEl === 7) {
          focusEl = 0
        }
        $(`.tool${focusEl + 1}`).focus()
        focusEl++
      }
    }
  })

  $('.main_box').focus()

  // AÇÃO PAUSAR/CONTINUAR
  $('.sp_input, .pv_input, .mv_input').keypress((e) => {
    if (String.fromCharCode(e.keyCode).match(/[^0-9.]/g)) {
      return false
    }
    if($(e.target).val().includes('.') && e.keyCode === 46) {
      return false
    }
    if($(e.target).val().length > 4 && $(e.target).val().includes('.')) {
      return false
    }
    if($(e.target).val().length >= 2 && !$(e.target).val().includes('.') && e.keyCode !== 46) {
      return false
    }
  })

  const action_pause = () => {
    toggleStatus()
    focusEl = 4
  }
  $('.main_box').on('click', action_pause)
  $('.main_box').on('keyup', (e) => {
    if (e.key === 'Enter') {
      action_pause()
    }
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      setMode(data.formData.mode === 'MANUAL' ? 'AUTOMATIC' : 'MANUAL')
    }
  })

  // AÇÃO MUDANÇA SETPOINT
  const action_setpoint = () => {
    if (data.selecting.sp == false && data.status !== 'finished') {
      $('.sp_input').attr('disabled', false)
      $('.sp_input').addClass('sp_input_selected')
      $('.sp_input').val('')
      $('.sp_input').focus()
      focusEl = 1
      data.selecting.sp = true
    }
  }
  const action_setpoint_cancel = () => {
    $('.sp_box').focus()
    $('.sp_input').attr('disabled', true)
    $('.sp_input').removeClass('sp_input_selected')
    $('.sp_input').val(`${data.currentData.sp}%`)
    focusEl = 1
    setTimeout(() => {
      data.selecting.sp = false
      focusEl = 1
    }, 200)
  }

  const action_setpoint_change = () => {
    const value = $('.sp_input').val()
    const sp = parseFloat(value.replace('%', ''))
    if (sp >= 5 && sp <= 90) {
      data.currentData.sp = sp
      $('.sp_input').val(`${data.currentData.sp}%`)

      generateToast(`Setpoint alterado para ${data.currentData.sp}%.`)
      setSP(data.currentData.sp)
      action_setpoint_cancel()
    }
  }
  $('.sp_box').on('dblclick', action_setpoint)
  $('.sp_box').on('keydown', (e) => {
    if (e.which === 13) {
      action_setpoint()
    }
  })
  $('.sp_input').on('keydown', (e) => {
    if (e.which === 27 && data.selecting.sp) {
      action_setpoint_cancel()
    }
    if (e.which === 13 && data.selecting.sp) {
      action_setpoint_change()
    }
  })
  $('.sp_box').on('focusout', (event) => {
    if (!$('.sp_box').has(event.relatedTarget).length) {
      if (data.selecting.sp) {
        action_setpoint_cancel()
      }
    }
  })

  // AÇÃO MUDANÇA pv
  const action_pv = () => {
    if (data.formData.controller_type === 'ON/OFF') {
      generateToast('Não é possível alterar a PV no controle ON/OFF.')
      return
    }
    if (data.formData.loop === 'CLOSED') {
      generateToast('Não é possível alterar a PV em malha fechada.')
      return
    }
    if (data.selecting.pv == false && data.status !== 'finished') {
      $('.pv_input').attr('disabled', false)
      $('.pv_input').addClass('pv_input_selected')
      $('.pv_input').val('')
      $('.pv_input').focus()
      focusEl = 2
      data.selecting.pv = true
    }
  }
  const action_pv_cancel = () => {
    $('.pv_box').focus()
    $('.pv_input').attr('disabled', true)
    $('.pv_input').removeClass('pv_input_selected')
    $('.pv_input').val(`${data.currentData.pv}%`)
    focusEl = 1
    setTimeout(() => {
      data.selecting.pv = false
      focusEl = 2
    }, 200)
  }

  const action_pv_change = () => {
    const value = $('.pv_input').val()
    const pv = parseFloat(value.replace('%', ''))
    if (pv >= 5 && pv <= 90) {
      data.currentData.pv = pv
      $('.pv_input').val(`${data.currentData.pv}%`)

      generateToast(`Variável de processo alterada para ${data.currentData.pv}%.`)
      setPV(data.currentData.pv)
      action_pv_cancel()
    }
  }
  
  $('.pv_box').on('dblclick', action_pv)
  $('.pv_box').on('keydown', (e) => {
    if (e.which === 13) {
      action_pv()
    }
  })
  $('.pv_input').on('keydown', (e) => {
    if (e.which === 27 && data.selecting.pv) {
      action_pv_cancel()
    }
    if (e.which === 13 && data.selecting.pv) {
      action_pv_change()
    }
  })
  $('.pv_box').on('focusout', (event) => {
    if (!$('.pv_box').has(event.relatedTarget).length) {
      if (data.selecting.pv) {
        action_pv_cancel()
      }
    }
  })

  // AÇÃO MUDANÇA MV
  const action_mv = () => {
    if (data.formData.controller_type === 'ON/OFF') {
      generateToast('Não é possível alterar a VM no controle ON/OFF.')
      return
    }
    if (data.formData.mode === 'AUTOMATIC') {
      generateToast('Não é possível alterar a VM em modo automático.')
      return
    }
    if (data.selecting.mv == false && data.status !== 'finished') {
      $('.mv_input').attr('disabled', false)
      $('.mv_input').addClass('mv_input_selected')
      $('.mv_input').val('')
      $('.mv_input').focus()
      focusEl = 3
      data.selecting.mv = true
    }
  }

  const action_mv_cancel = () => {
    $('.mv_box').focus()
    $('.mv_input').attr('disabled', true)
    $('.mv_input').removeClass('mv_input_selected')
    $('.mv_input').val(`${data.currentData.mv}%`)
    focusEl = 1
    setTimeout(() => {
      data.selecting.mv = false
      focusEl = 3
    }, 200)
  }

  const action_mv_change = () => {
    const value = $('.mv_input').val()
    const mv = parseFloat(value.replace('%', ''))
    if (mv >= 5 && mv <= 90) {
      data.currentData.mv = mv
      $('.mv_input').val(`${data.currentData.mv}%`)

      generateToast(`Variável manipulada alterada para ${data.currentData.mv}%.`)
      setMV(data.currentData.mv)
      action_mv_cancel()
    }
  }
  $('.mv_box').on('dblclick', action_mv)
  $('.mv_box').on('keydown', (e) => {
    if (e.which === 13) {
      action_mv()
    }
  })
  $('.mv_input').on('keydown', (e) => {
    if (e.which === 27 && data.selecting.mv) {
      action_mv_cancel()
    }
    if (e.which === 13 && data.selecting.mv) {
      action_mv_change()
    }
  })
  $('.mv_box').on('focusout', (event) => {
    if (!$('.mv_box').has(event.relatedTarget).length) {
      if (data.selecting.mv) {
        action_mv_cancel()
      }
    }
  })

  // AÇÃO ABERTA POPUP DE CONSTANTES
  $('.box_constants').on('click', openPopupConstants)
  $('.box_constants').on('keypress', (e) => {if (e.which === 13) {openPopupConstants()} })

  // AÇÃO ABERTA POPUP DE COMANDOS
  $('.box_actions').on('click', openPopupActions)
  $('.box_actions').on('keypress', (e) => {if (e.which === 13) {openPopupActions()} })

  // AÇÃO SAIR
  $('.box_exit').on('click', openPopupExit)
  $('.box_exit').on('keypress', (e) => {if (e.which === 13) {openPopupExit()} })

  // ATALHO FOCO NO TOOLBAR
  $(document).keydown((e) => {
    if (e.altKey && e.key === 'c') {
      $('.main_box').focus()
      focusEl = 4
    }
    if (e.altKey && e.key === 'k') {
      $('#kp').focus()
    }
    if (e.altKey && e.key === 'a') {
    }
    if ((e.altKey || e.ctrlKey) && e.key === '/') {
      openPopupShortcuts()
    }

    if ((e.altKey || e.ctrlKey) && (e.key === '=' || e.key === '-' || e.key === '_' || e.key === '+')) {
      e.preventDefault()
    }

    // ATALHO PARA MUDAR ESCALA
    if ((e.ctrlKey || e.altKey) && e.key === 'ArrowRight') {
      e.preventDefault()
      if (data.currentScale < 6) {
        setScale(data.currentScale + 1)
      }
    }
    if ((e.ctrlKey || e.altKey) && e.key === 'ArrowLeft') {
      e.preventDefault()
      if (data.currentScale > 1) {
        setScale(data.currentScale - 1)
      }
    }

    // ATALHO PARA MUDAR VELOCIDADE
    if ((e.altKey || e.ctrlKey) && e.key === '=') {
      e.preventDefault()
      if (data.currentSpeed < 3) {
        setSpeed(data.currentSpeed + 1)
      }
    }
    if ((e.altKey || e.ctrlKey) && e.key === '-') {
      e.preventDefault()
      if (data.currentSpeed > 1) {
        setSpeed(data.currentSpeed - 1)
      }
    }

    if (
      e.key === 'F1' || e.key === 'F2' || e.key === 'F3' ||
      e.key === 'F4' || e.key === 'F5' || e.key === 'F6' ||
      e.key === 'F7' || e.key === 'F8' || e.key === 'F9' || e.key === 'F10') {
      e.preventDefault()
    }

    if (e.key === 'F10') {
      const formattedDate = new Date().toLocaleString('pt-BR', {
        timeZone: 'America/Sao_Paulo',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })
      chart.set('exportFileName', `Simux-${formattedDate}`)
      chart.exportChart({format: 'png'})
    }
  })

  // ATALHO PARA PAUSAR/CONTINUAR
  $('.toolbox').keydown((e) => {
    if (e.key === ' ') {
      toggleStatus()
    }
  })
}