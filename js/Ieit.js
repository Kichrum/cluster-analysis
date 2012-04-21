/**
  * Клас, що об`еднує усі класи ІЕІТ
  */
var Ieit = jQuery.Class.create({
  init: function(selector) {
    this.min = false, this.max = false;
    this.data = Array();
    this.loadImagesListener(selector);
  },
  // Кількість класів розпізнавання
  getLength: function() {
    return this.data.length;
  },
  // Кількість реалізацій базового класу
  getImplCount: function() {
    return this.data[0].trainingMatrix[0].length;
  },
  // Повертає масив класів розпізнавання
  getData: function() {
    return this.data;
  },
  // Створення нового класу розпізнавання із зображення
  addClass: function(source) {
    this.data[this.getLength()] = new IeitClass(source, false);
  },
  // Створення нового класу розпізнавання із текстового файлу
  addClassFromText: function(source) {
    var subArr = source.split("\n");
    var arrTransp = Array();
    for(var i = 0; i < subArr.length; i++) {
      if(subArr[i].length > 0) {
        arrTransp[i] = subArr[i].split("\t");
        for(var j = 0; j < arrTransp[i].length; j++)
          arrTransp[i][j] = parseFloat(arrTransp[i][j].replace(',', '.'));
      }
    }
    var arr = Array();
    for(var i = 0; i < arrTransp[0].length; i++) {
      arr[i] = Array();
      for(var j = 0; j < arrTransp.length; j++)
        arr[i][j] = arrTransp[j][i]; // transpon
    }
    if(this.min != true && this.max != true) {
      this.max = arr[0][0];
      this.min = arr[0][0];
    }
    for(var i = 0; i < arr.length; i++)
      for(var j = 0; j < arr[i].length; j++) {
        if(arr[i][j] > this.max)
          this.max = arr[i][j];
        if(arr[i][j] < this.min)
          this.min = arr[i][j];
      }
    this.data[this.getLength()] = new IeitClass(arr, true);
    for(var i = 0; i < this.getLength(); i++)
      this.data[i].trainingMatrixCreateFromText(this.data[i].trainingMatrix, this.min, this.max);
    //var min = arr[0][0], max = arr[0][0];
    //for(var i = 0; i < this.
    
    //console.log(arr);
    //console.log(arr[0][0] + 2.5);
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
        if(f.type.match('text.*') || f.name.match('\.sppr')) {
          //alert(f.type);
          var reader = new FileReader();
          reader.onload = (function(theFile) {
            return function(e) {
              //console.log(e.target.result);
              dropZone.append('<span>&nbsp;[' +theFile.name+ ']&nbsp;</span>');
              //$( ".thumb" ).draggable({ axis: 'x' }); // Фокус-покус ;)
              data.addClassFromText(e.target.result);
            };
          })(f);
          reader.readAsText(f);
        }
        else if (f.type.match('image.*')) {
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
    this.trainingBasic = new IeitTraining(this.data, {
      selectionLevel: $(options.selectionLevelSel).val(),
      admission: $(options.admissionSel).val(),
      kfeType: options.kfeType
    });
  },
  
  optimizationParallel: function(options) {
    options = jQuery.extend({
          selectionLevelSel: '#sel-level',
          admissionSel: '#admission',
          kfeType: 'shannon'
        }, options);
    this.trainingParallel = new IeitTraining(this.data, {
      selectionLevel: $(options.selectionLevelSel).val(),
      admission: $(options.admissionSel).val(),
      kfeType: options.kfeType,
      optimization: 'parallel'
    });
  },
  
  optimizationSeries: function(options) {
    options = jQuery.extend({
          selectionLevelSel: '#sel-level',
          admissionSel: '#admission',
          kfeType: 'shannon'
        }, options);
    this.trainingSeries = new IeitTraining(this.data, {
      selectionLevel: $(options.selectionLevelSel).val(),
      admission: $(options.admissionSel).val(),
      kfeType: options.kfeType,
      optimization: 'series'
    });
  },
  
  exam: function(options) {
    options = jQuery.extend({
          classSel: '#exam-class',
          implementationSel: '#exam-impl',
          examResultsSel: '#exam-results',
          training: this.trainingBasic
        }, options);
    this.examData = new IeitExam({
      training: options.training,
      classNum: $(options.classSel).val()-1,
      examResults: $(options.examResultsSel),
      implementation: $(options.implementationSel).val()-1
    });
  },
  
  clustering: function() {
    //console.log(this.data);
    this.clusters = new IeitCluster(this.data);
    //console.log(this.data);
    /*options = jQuery.extend({
          selectionLevelSel: '#sel-level',
          admissionSel: '#admission',
          kfeType: 'shannon'
        }, options);
    
    this.trainingParallel = new IeitTraining(this.data, {
      selectionLevel: $(options.selectionLevelSel).val(),
      admission: $(options.admissionSel).val(),
      kfeType: options.kfeType,
      optimization: 'parallel'
    });
    */
  }
  
});