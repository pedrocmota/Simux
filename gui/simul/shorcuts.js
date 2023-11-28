const startShortcut = () => {
  let focusEl = 4
  $('body').keydown((e) => {
    const key = e.which
    if (key === 37) {//ESQUERDA
      $(`.tool${focusEl}`).removeClass('focusable')
      if(focusEl === 1) {
        focusEl = 8
      }
      $(`.tool${focusEl - 1}`).addClass('focusable')
      $(`.tool${focusEl - 1}`).focus()
      focusEl--
    }
    if (key === 39) {//DIREITA
      $(`.tool${focusEl}`).removeClass('focusable')
      if(focusEl === 7) {
        focusEl = 0
      }
      $(`.tool${focusEl + 1}`).addClass('focusable')
      $(`.tool${focusEl + 1}`).focus()
      focusEl++
    }
  })
}