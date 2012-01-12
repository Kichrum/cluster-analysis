/**
  * Відображення всіх елементів сторінки
  */
jQuery.fn.ieiPrintTables = function(matrix){
  for(var i = 0; i < matrix.length; i++) {
    $(this).append('<table id="tm'+i+'" />');
    $('#tm'+i).jqGridFromArray({arr:DataBase.trainingMatrix[i], col_width:15, name: "Навчальна матриця зображення №"+(i+1), height: 250});
  }
}


// Запуск всіх елементів сторінки
Highcharts.setOptions({lang: {
    resetZoom: 'Повернутися до повномасштабного перегляду',
    loading: 'Завантаження...'
  }
});
var DataBase = {};
$(function(){
  $('#tabs').tabs();
  $('#tabs').tabs('disable','tabs-exam'); // Скоро буде...
  $('#tabs-results').tabs();
  $('button').button();
  
  //slider
  new IeitDraw().slider({selector: '#admission-slider', input: '#admission', value: 40, min: 0, max: 100, step: 1});
  new IeitDraw().slider({selector: '#sel-level-slider', input: '#sel-level'});
  
  //$('#set-opt').buttonset();
  //$('#set-kfe').buttonset();
  //$('#set-opt').buttonset('disable');
  
  var ieitVar = new Ieit('#drop-zone');
  
  //test
  $('.matrix.training button').click(function(){
    ieitVar.drawTrainingMatrixes('#training-matrix');
  });

  $('#set-kfe').buttonset().change(function(){
    ieitVar.training({kfeType: $('input:checked', this).attr('id')});
    ieitVar.trainingBasic.drawBinaryMatrixes('#binary-matrix');
    ieitVar.trainingBasic.drawEtalonVectors('#etalon-matrix');
    ieitVar.trainingBasic.printCharacteristics('#characteristics');
    ieitVar.trainingBasic.printOptimalRadius('#radius');
    ieitVar.trainingBasic.drawOptimization('#optimization-chart');
    ieitVar.trainingBasic.printCodeDistance('#code-distance');
    
  });
  $('#set-opt').buttonset().change(function(){
    ieitVar.optimizationParallel();
    ieitVar.trainingParallel.drawBinaryMatrixes('#binary-matrix');
    ieitVar.trainingParallel.drawEtalonVectors('#etalon-matrix');
    ieitVar.trainingParallel.printCharacteristics('#characteristics');
    ieitVar.trainingParallel.printOptimalRadius('#radius');
    ieitVar.trainingParallel.drawOptimization('#optimization-chart');
    ieitVar.trainingParallel.printCodeDistance('#code-distance');
    
  });
});