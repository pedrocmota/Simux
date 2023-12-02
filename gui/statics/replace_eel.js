eel = {
  ...eel,
  _position_window: function (page) {
    if (page !== 'main.html') {
      return;
    }
    let size = eel._start_geometry['default'].size;
    let position = eel._start_geometry['default'].position;

    if (page in eel._start_geometry.pages) {
      size = eel._start_geometry.pages[page].size;
      position = eel._start_geometry.pages[page].position;
    }

    if (size != null) {
      window.resizeTo(size[0], size[1]);
    }

    if (position != null) {
      window.moveTo(position[0], position[1]);
    }
  }
}