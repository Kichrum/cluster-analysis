/**
  * Клас, що об`еднує усі класи ІЕІТ
  */
var Ieit = jQuery.Class.create({
  init: function(selector) {
    this.data = Array();
    this.loadImagesListener(selector);
  },
  // Кількість класів розпізнавання
  getLength: function() {
    return this.data.length;
  },
  // Повертає масив класів розпізнавання
  getData: function() {
    return this.data;
  },
  // Створення нового класу розпізнавання
  addClass: function(source) {
    this.data[this.getLength()] = new IeitClass(source);
  },
  // Загрузка зображення
  loadImagesListener: function(selector) {    
    var data = this;
    function handleFileSelect(evt) {
      evt.stopPropagation();
      evt.preventDefault();
      var files = evt.dataTransfer.files;
      var dropZone = $(selector);
      for (var i = 0, f; f = files[i]; i++) {
        if (!f.type.match('image.*')) {
          continue;
        }
        var reader = new FileReader();
        reader.onload = (function(theFile) {
            return function(e) {
                dropZone.append('<span><img class="thumb" src="' +e.target.result+
                                '" title="' +theFile.name+ '"/></span>');
                $( ".thumb" ).draggable({ axis: 'x' }); // Фокус-покус ;)
                data.addClass(e.target.result);
            };
        })(f);
        reader.readAsDataURL(f);
      }
    }
    function handleDragOver(evt) {
      evt.stopPropagation();
      evt.preventDefault();
    }
    var dropZone = $(selector)[0];
    dropZone.addEventListener('dragover', handleDragOver, false);
    dropZone.addEventListener('drop', handleFileSelect, false);
    return true;
  },
  // Рендерінг зображень навчальних матриць
  drawTrainingMatrixes: function(selector){
    //console.log('drawTrainingMatrixes');
    $(selector).empty();
    for(var i = 0; i < this.getLength(); i++)
      this.data[i].drawTrainingMatrix(selector);
  },
  // Запуск базового алгоритму навчання
  training: function(options) {
    options = jQuery.extend({
          selectionLevelSel: '#sel-level',
          admissionSel: '#admission',
          kfeType: 'shannon'
        }, options);
    //console.log(options.kfeType);
    this.trainingBasic = new IeitTraining(this.data, {
      selectionLevel: $(options.selectionLevelSel).val(),
      admission: $(options.admissionSel).val(),
      kfeType: options.kfeType
    });
    /*
    this.trainingBasic.drawBinaryMatrixes('#binary-matrix');
    this.trainingBasic.drawEtalonVectors('#etalon-matrix');
    this.trainingBasic.printCharacteristics('#characteristics');
    this.trainingBasic.printOptimalRadius('#radius');
    this.trainingBasic.drawOptimization('#optimization-chart');
    this.trainingBasic.printCodeDistance('#code-distance');
    */
  }
  
});