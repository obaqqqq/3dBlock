//------------------------------------------------
//createImage
//------------------------------------------------
function createImage(_imagefile,_width,_height,_x,_y,_z,_offsetX,_offsetY){
  //private-----------------------------
  var obj = document.createElement('div');
  var width = _width;
  var height = _height;
  var x = _x ? _x : 0;
  var y = _y ? _y : 0;
  var z = _z ? _z : 0;
  var offsetX = _offsetX ? _offsetX : 0;
  var offsetY = _offsetY ? _offsetY : 0;
  
  //getter------------------------------
  this.getX = function(){
    return x;
  };
  this.getY = function(){
    return y;
  };
  this.getZ = function(){
    return z;
  };
  this.getWidth = function(){
    return width;
  };
  this.getHeight = function(){
    return height;
  };
  this.getOffsetX = function(){
    return offsetX;
  };
  this.getOffsetY = function(){
    return offsetY;
  };
  //setter------------------------------
  this.setX = function(_x){
    x = _x;
    obj.style.left = x + 'px';
  };
  this.setY = function(_y){
    y = _y;
    obj.style.top = y + 'px';
  };
  this.setZ = function(_z){
    z = _z;
    obj.style.zIndex = z;
  };
  this.setWidth = function(_width){
    width = _width;
    obj.style.width = width + 'px';
  };
  this.setHeight = function(_height){
    height = _height;
    obj.style.height = height + 'px';
  };
  this.setOffsetX = function(_offsetX){
    offsetX = _offsetX;
    _setOffset(obj,offsetX,offsetY)
  };
  this.setOffsetY = function(_offsetY){
    offsetY = _offsetY;
    _setOffset(obj,offsetX,offsetY)
  };
  //other method------------------------
  this.hide = function(){
    obj.style.display = 'none';
  };
  this.view = function(){
    obj.style.display = 'block';
  };
  
  obj.style.backgroundImage = 'url('+_imagefile+')';
  obj.style.backgroundRepeat = 'no-repeat';
  _setOffset(obj,offsetX,offsetY)
  obj.style.width = width + 'px';
  obj.style.height = height + 'px';
  obj.style.position = 'absolute';
  obj.style.top = y + 'px';
  obj.style.left = x + 'px';
  obj.style.zIndex = z;
  document.getElementsByTagName('body')[0].appendChild( obj );
  return this;
}

function _setOffset(obj,offsetX,offsetY){
  var offset = offsetX ? '-'+ offsetX + 'px ' : '0px ';
  offset += offsetY ? '-'+ offsetY + 'px' : '0px';
  obj.style.backgroundPosition = offset;
}
