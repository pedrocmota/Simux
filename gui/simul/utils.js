const generateToast = (message) => {
  $.toast({
    text: message,
    bgColor: '#444444',
    textColor: '#eeeeee',
    fontSize: 16,
    showHideTransition: 'fade',
    allowToastClose: true,
    hideAfter: 3000,
    stack: 5,
    position: 'top-right',
    textAlign: 'left',
    loader: false,
    allowToastClose: false
  })
}