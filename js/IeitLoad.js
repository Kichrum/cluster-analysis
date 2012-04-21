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
  $('#tabs-results').tabs();
  $('button').button();
  
  //slider
  new IeitDraw().slider({selector: '#admission-slider', input: '#admission', value: 40, min: 0, max: 100, step: 1});
  new IeitDraw().slider({selector: '#sel-level-slider', input: '#sel-level'});
  
  
  var ieitVar = new Ieit('#drop-zone');
  
  //test
  $('.matrix.training button').click(function(){
    ieitVar.drawTrainingMatrixes('#training-matrix');
  });

  var training;
  function setExamSlider(trainingVal) {
    training = trainingVal;
    new IeitDraw().slider({selector: '#exam-class-slider', input: '#exam-class', value: 1, min: 1, max: ieitVar.getLength(), step: 1});
    new IeitDraw().slider({selector: '#exam-impl-slider', input: '#exam-impl', value: 1, min: 1, max: ieitVar.getImplCount(), step: 1});
    return 0;
  }
  
  $('#set-kfe').buttonset().change(function(){
    ieitVar.training({kfeType: $('input:checked', this).attr('id')});
    ieitVar.trainingBasic.drawBinaryMatrixes('#binary-matrix');
    ieitVar.trainingBasic.drawEtalonVectors('#etalon-matrix');
    ieitVar.trainingBasic.printCharacteristics('#characteristics');
    ieitVar.trainingBasic.printOptimalRadius('#radius');
    ieitVar.trainingBasic.drawOptimization('#optimization-chart');
    ieitVar.trainingBasic.printCodeDistance('#code-distance');
    setExamSlider(ieitVar.trainingBasic);
  });
  $('#set-opt').buttonset().change(function(){
    if($('input:checked', this).attr('id') == 'parallel') {
      ieitVar.optimizationParallel({kfeType: $('#set-kfe input:checked').attr('id')});
      ieitVar.trainingParallel.drawBinaryMatrixes('#binary-matrix');
      ieitVar.trainingParallel.drawEtalonVectors('#etalon-matrix');
      ieitVar.trainingParallel.printCharacteristics('#parallel-characteristics');
      ieitVar.trainingParallel.printOptimalRadius('#radius');
      ieitVar.trainingParallel.drawOptimization('#parallel-optimization-chart');
      ieitVar.trainingParallel.drawIterations('#parallel-optimization-iterations-chart');
      ieitVar.trainingParallel.printCodeDistance('#code-distance');
      setExamSlider(ieitVar.trainingParallel);
    }
    else {
      ieitVar.optimizationSeries({kfeType: $('#set-kfe input:checked').attr('id')});
      ieitVar.trainingSeries.drawBinaryMatrixes('#binary-matrix');
      ieitVar.trainingSeries.drawEtalonVectors('#etalon-matrix');
      ieitVar.trainingSeries.printCharacteristics('#series-characteristics');
      ieitVar.trainingSeries.printOptimalRadius('#radius');
      ieitVar.trainingSeries.drawOptimization('#series-optimization-chart');
      ieitVar.trainingSeries.printCodeDistance('#code-distance');
      setExamSlider(ieitVar.trainingSeries);
    }
  });
  
  $('#exam-do').button().click(function() {
    ieitVar.exam({training: training});
  });
  
  $('#clustering').button().click(function() {
    ieitVar.clustering();
  });
  
});