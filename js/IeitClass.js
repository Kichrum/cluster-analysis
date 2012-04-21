/**
  * Клас одного класу розпізнавання в ІЕІТ
  */
var IeitClass = jQuery.Class.create({
  init: function(source, isText) {
    if(isText != false) {
      this.trainingMatrix = source;
      //this.trainingMatrixImage = Array();
      //this.trainingMatrixCreateFromText(source, source[0][0], source[0][0]);
    }
    else {
      this.trainingMatrix = Array();
      this.trainingMatrixCreate(source);
    }
  },
  // Створення навчальної матриці із зображення
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
          var bright = red; // (<= 255)
          dataBase.trainingMatrix[x][y] = bright;
        }
      }
    }
    image.src = src;
    return true;
  },
  // Створення навчальної матриці із текстових даних
  trainingMatrixCreateFromText: function(src, min, max) {
    this.trainingMatrixImage = Array();
    var coef = 255 / ( max - min );
    for(var x = 0; x < src.length; x++) {
      this.trainingMatrixImage[x] = Array();
      for(var y = 0; y < src[x].length; y++) {
        this.trainingMatrixImage[x][y] = parseInt(src[x][y] * coef + 0.5);
      }
    }
    //console.log(this.trainingMatrixImage);
    return true;
  },
  // Виведення навчальної матриці зображенням
  drawTrainingMatrix: function(selector) {
    //console.log('drawTrainingMatrix('+selector+')');
    if(this.trainingMatrixImage)
      new IeitDraw().imageFromMatrix(this.trainingMatrixImage, selector);
    else
      new IeitDraw().imageFromMatrix(this.trainingMatrix, selector);
  }
  
});