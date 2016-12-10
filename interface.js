var Key = {
  _pressed: {},

  LEFT: 37,
  UP: 38,
  RIGHT: 39,
  DOWN: 40,

  isDown: function(keyCode) {
        return this._pressed[keyCode];
  },

  onKeydown: function(event) {
    if(event.keyCode == this.LEFT || event.keyCode == 65){
      this._pressed[this.LEFT] = true;
    } else if(event.keyCode == this.RIGHT || event.keyCode == 68){
      this._pressed[this.RIGHT] = true;
    } else if(event.keyCode == this.UP || event.keyCode == 87){
      this._pressed[this.UP] = true;
    } else if(event.keyCode == this.DOWN || event.keyCode == 83){
      this._pressed[this.DOWN] = true;
    }
  },

  onKeyup: function(event) {
    if(event.keyCode == this.LEFT || event.keyCode == 65){
      delete this._pressed[this.LEFT];
    } else if(event.keyCode == this.RIGHT || event.keyCode == 68){
      delete this._pressed[this.RIGHT];
    } else if(event.keyCode == this.UP || event.keyCode == 87){
      delete this._pressed[this.UP];
    } else if(event.keyCode == this.DOWN || event.keyCode == 83){
      delete this._pressed[this.DOWN];
    }
  }
}

window.addEventListener('keyup', function(event) {
  if(event.keyCode == 37 || event.keyCode == 38 ||event.keyCode == 39 ||event.keyCode == 40 ||
    event.keyCode == 65 || event.keyCode == 68 ||event.keyCode == 87 ||event.keyCode == 83) {
    event.preventDefault();
    Key.onKeyup(event);
  }
},false);

window.addEventListener('keydown', function(event) {
  if(event.keyCode == 37 || event.keyCode == 38 ||event.keyCode == 39 ||event.keyCode == 40 ||
    event.keyCode == 65 || event.keyCode == 68 ||event.keyCode == 87 ||event.keyCode == 83) {
    event.preventDefault();
    Key.onKeydown(event);
  }
},false);
