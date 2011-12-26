/**
  * Клас візуалізації ІЕІТ (статичні класи)
  */
var IeitDraw = jQuery.Class.create({
  // Виведення матриці зображенням у селектор
  imageFromMatrix: function(matrix, selector) {
    selector = $(selector);
    $(selector).append('<canvas></canvas>');
    var canvas = $('canvas:last-child', selector)[0];
    canvas.width=matrix.length;
    canvas.height=matrix[0].length;
    var ctx = canvas.getContext('2d');
    var canvasData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    for(var i = 0; i < canvasData.width; i++){
      for(var j = 0; j < canvasData.height; j++){
        var idx = (i + j * canvas.width) * 4;
        canvasData.data[idx + 0] = matrix[i][j]; // RED - красный
        canvasData.data[idx + 1] = matrix[i][j]; // GREEN - зелёный
        canvasData.data[idx + 2] = matrix[i][j]; // BLUE - синий
        /*
        // Вивод бінарних синім
        canvasData.data[idx + 0] = matrix[i][j]==0?0:matrix[i][j]; // RED - красный
        canvasData.data[idx + 1] = matrix[i][j]==0?120:matrix[i][j]; // GREEN - зелёный
        canvasData.data[idx + 2] = matrix[i][j]==0?174:matrix[i][j]; // BLUE - синий
        */
        canvasData.data[idx + 3] = 255; // ALPHA - альфа-канал
      }
    }
    ctx.putImageData(canvasData, 0, 0);
  },
  slider: function(options){
    options = jQuery.extend({
      selector: '#slider',
      input: '#slider-input',
      value: 0.53,
      min: 0,
      max: 1,
      step: 0.01
    }, options);
    $(options.selector).slider({
      value: options.value,
      min: options.min,
      max: options.max,
      step: options.step,
      slide: function(event, ui) {
        $(options.input).val(ui.value);
        //BinEtalon();
      }
    });
    $(options.input).val($(options.selector).slider("value"));
  },
  // Побудова таблиці із масива
  gridFromArray: function(options) {
    options = jQuery.extend({
      arr: Array(),
      selector: "#grid",
      name: "Масив елементів",
      col_width: 35,
      height: "auto",
      sub_arr: null
    }, options);
    var colModel = [], colNames = [];
    for(var i = 0; i <= options.arr.length; i++) {
      colNames[i] = i;
      if(i == 0)
        colNames[i] = '№';
      if(options.col_width < 35 && i == options.arr.length)
        options.col_width = 35;
      colModel[i] = {name:'id'+i,index:'id'+i, width:options.col_width, height: 15, sortable: false};
    }
    jQuery(options.selector).jqGrid({
      datatype: "local",
      height: options.height,
      colNames: colNames, //['Inv No','Date', 'Client', 'Amount','Tax','Total','Notes'],
      colModel: colModel,
      caption: options.name
    });
    var mydata = [];
    for(var i = 0; i < options.arr.length; i++) {
      mydata[i] = {};
      mydata[i].id0 = i+1;
      for(var j = 0; j <= (options.sub_arr?options.arr[i][options.sub_arr].length:options.arr[i].length); j++) {
        //console.log(options.arr[i][options.sub_arr][j]);
        eval('mydata['+i+'].id'+(j+1)+' = '+ (options.sub_arr?options.arr[i][options.sub_arr][j]:options.arr[i][j]));
      }
    }
    for(var i=0;i<=mydata.length;i++)
      jQuery(options.selector).jqGrid('addRowData',i+1,mydata[i]);
  }
});