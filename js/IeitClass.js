/**
  * Клас одного класу розпізнавання в ІЕІТ
  */
var IeitClass = jQuery.Class.create({
  init: function(source) {
    this.trainingMatrix = Array();
    this.trainingMatrixCreate(source);
  },
  // Створення навчальної матриці
  trainingMatrixCreate: function(src) {
    var image = new Image();
    var dataBase = this;
    image.onload = function() {
      var canvas = document.createElement('canvas');
      canvas.width = image.width;
      canvas.height = image.height;
      var context = canvas.getContext('2d');
      context.drawImage(image, 0, 0);
      var imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      for(var x = 0; x < canvas.width; x++){
        dataBase.trainingMatrix[x] = Array();
        for(var y = 0; y < canvas.height; y++) {
          var index = (y*imageData.width + x) * 4,
          red = imageData.data[index],
          green = imageData.data[index + 1],
          blue = imageData.data[index + 2],
          alpha = imageData.data[index + 3];
          // Формула яскравості: Y = 0.299 * R + 0.587 * G + 0.114 * B
          //var bright = Math.round(0.299*red + 0.587*green + 0.114*blue);
          var bright = Math.floor(0.299*red + 0.587*green + 0.114*blue); // (<= 255)
          dataBase.trainingMatrix[x][y] = bright;
        }
      }
    }
    image.src = src;
    return true;
  },
  // Виведення навчальної матриці зображенням
  drawTrainingMatrix: function(selector) {
    //console.log('drawTrainingMatrix('+selector+')');
    new IeitDraw().imageFromMatrix(this.trainingMatrix, selector);
  }
  
});