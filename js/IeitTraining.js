/**
  * Клас навчання ІЕІТ
  */
var IeitTraining = jQuery.Class.create({
  init: function(data, options) {
    this.options = jQuery.extend({
          selectionLevel: 0.53,
          admission: 40,
          kfeType: 'shannon'
        }, options);
    this.ieitData = data;
    this.data = Array();
    for(var i = 0; i < this.ieitData.length; i++) {
      this.data[i] = {};
    }
    
    this.selectionLevel = options.selectionLevel;
    this.admission = options.admission;
    this.controlApprovals();
    this.binEtalon();
    this.codeDistance();
    this.neighbour();
    this.characteristics();
    this.optimalRadius();  
  },
  // Створення масиву контрольних допусків
  controlApprovals: function() {
    for(var i = 0; i < this.ieitData.length; i++) {
      this.data[i].dk = Array();
      this.data[i].ndk = Array();
      this.data[i].vdk = Array();
      for(var j = 0; j < this.ieitData[i].trainingMatrix.length; j++) {
        var height = this.ieitData[i].trainingMatrix[j].length;
        this.data[i].dk[j] = 0;
        for(var k = 0; k < height; k++) {
          this.data[i].dk[j] += this.ieitData[i].trainingMatrix[j][k];
        }
        this.data[i].dk[j] /= height;
        this.data[i].dk[j] = Math.floor(this.data[i].dk[j]); // may be round =)
        this.data[i].ndk[j] = this.data[i].dk[j] - this.admission;
        this.data[i].vdk[j] = this.data[i].dk[j] + +this.admission;
      }
      //console.log(this.data[i].dk[50]);
    }
  },
  // Створення бінарної матриці та еталонного вектора
  binEtalon: function(){
    for(var i = 0; i < this.ieitData.length; i++) {
      this.data[i].binaryMatrix = Array();
      this.data[i].etalonVector = Array();
      for(var j = 0; j < this.ieitData[i].trainingMatrix.length; j++) {
        this.data[i].binaryMatrix[j] = Array();
        var height = this.ieitData[i].trainingMatrix[j].length;
        var ev = 0;
        for(var k = 0; k < height; k++) {
          var bright = this.ieitData[i].trainingMatrix[j][k];
          var bin = (this.data[i].ndk[j] <= bright && this.data[i].vdk[j] >= bright) ? 1 : 0;
          this.data[i].binaryMatrix[j][k] = bin;
          ev += bin;
        }
        ev /= height;
        this.data[i].etalonVector[j] = (ev >= this.selectionLevel) ? 1 : 0;
      }
      //console.log(this.data[i].etalonVector[50]);
      //console.log(this.data[i].vdk[50]);
    }
  },
  drawBinaryMatrixes: function(selector){
    $(selector).empty();
    for(var i = 0; i < this.data.length; i++) {
      var binary = Array();
      for(var j = 0; j < this.data[i].binaryMatrix.length; j++) {
        binary[j] = Array();
        for(var k = 0; k < this.data[i].binaryMatrix[j].length; k++)
          binary[j][k] = Math.abs(this.data[i].binaryMatrix[j][k]-1)*255;
      }
      new IeitDraw().imageFromMatrix(binary, selector);
    }
  },
  drawEtalonVectors: function(selector){
    $(selector).empty();
    for(var i = 0; i < this.data.length; i++) {
      binary = Array();
      for(var j = 0; j < this.data[i].etalonVector.length; j++) {
        binary[j] = Array();
        for(var k = 0; k < 30; k++) {
          binary[j][k] = Math.abs(this.data[i].etalonVector[j]-1)*255;
        }
      }
      new IeitDraw().imageFromMatrix(binary, selector);
    }
  },
  // Масив |PARA| кодових відстаней між геометричними цетрами EV
  codeDistance: function(){
    for(var i = 0; i < this.ieitData.length; i++) {
      this.data[i].codeDistance = Array();
      var width = this.data[i].etalonVector.length;
      for(var j = 0; j < this.ieitData.length; j++) {
        this.data[i].codeDistance[j] = 0;
        for(var k = 0; k < width; k++)
          this.data[i].codeDistance[j] += (this.data[i].etalonVector[k] + this.data[j].etalonVector[k]) % 2;
        //console.log(this.data[i].codeDistance[j]);
      }
    }
  },
  printCodeDistance: function(selector) {
    $(selector).html("<table id='code-distance-table' />");
    new IeitDraw().gridFromArray({selector: "#code-distance-table", arr: this.data, sub_arr: "codeDistance", name: "Кодова відстань", col_width: 45});
  },
  // Пошук сусідніх класів та матриці SK
  neighbour: function(){
    for(var i = 0; i < this.data.length; i++) {
      // 1. Пошук сусіднього класу
      var height = this.data[i].binaryMatrix[0].length;
      this.data[i].neighbour = Array();
      this.data[i].neighbour['nb'] = 0;
      for(var j = 0; j < this.data.length; j++)
        if(
          (this.data[i].codeDistance[this.data[i].neighbour['nb']] == 0) || (
            this.data[i].codeDistance[j] != 0 
            && this.data[i].codeDistance[this.data[i].neighbour['nb']] > this.data[i].codeDistance[j]
          )
        )
          this.data[i].neighbour['nb'] = j;
      //console.log(this.data[i].neighbour['nb']);
      
      // 2. Побудова матриці SK
      for(var j = 0; j < height; j++) {
        var sk1 = 0, sk2 = 0;
        for(var k = 0; k < this.data[i].etalonVector.length; k++) {
          sk1 += (this.data[i].etalonVector[k] + +this.data[i].binaryMatrix[j][k]) % 2;
          sk2 += (this.data[i].etalonVector[k] + +this.data[this.data[i].neighbour['nb']].binaryMatrix[j][k]) % 2;
        }
        this.data[i].neighbour[j] = Array();
        this.data[i].neighbour[j]['sk1'] = sk1;
        this.data[i].neighbour[j]['sk2'] = sk2;
        //console.log(i + ' ' + this.data[i].neighbour[j]['sk1'] + ' ' + this.data[i].neighbour[j]['sk2']);
      }
    }
  },
  printSK: function() {
    //!!!
  },
  // Обчислення КФЕ за мірою Шеннона
  shannonKfe: function(alpha, beta, d1, d2){
    //console.log(alpha);
    return 1 + 1./2. * (
      (alpha && alpha + d2 ?
        (alpha / (alpha + d2)) * Math.log(alpha / (alpha + d2)) / Math.log(2.0)
      : 0) +
      (d1 && d1 + beta ?
        (d1 / (d1 + beta)) * Math.log(d1 / (d1 + beta)) / Math.log(2.0)
      : 0) +
      (beta && d1 + beta ?
        (beta / (d1 + beta)) * Math.log(beta / (d1 + beta)) / Math.log(2.0)
      : 0) +
      (d2 && alpha + d2 ?
        (d2 / (alpha + d2)) * Math.log(d2 / (alpha + d2)) / Math.log(2.0)
      : 0)
    );
  },
  // Обчислення КФЕ за мірою Кульбака
  kulbakKfe: function(alpha, beta, d1, d2){
    console.log('kulbak');
    alpha+=alpha?0:0.00001; // А чи можна так робити?...
    beta+=beta?0:0.00001; // І так... Бо інакше виходять розірвані графіки!
    return ( (d1+d2) && (alpha+beta)
      ? 0.5*(Math.log((d1+d2)/(alpha+beta))/Math.log(2.0))*(d1+d2-alpha-beta) :
      0);
  },
  // Обчислення точнісних характеристик
  characteristics: function(){
    for(var i = 0; i < this.data.length; i++) {
      var height = this.data[i].binaryMatrix[0].length;
      var dmax = this.data[i].codeDistance[this.data[i].neighbour['nb']];
      this.data[i].kfe = Array();
      for(var d = 0; d < dmax; d++) {
        this.data[i].kfe[d] = Array();
        this.data[i].kfe[d]['k1'] = this.data[i].kfe[d]['k2'] = this.data[i].kfe[d]['k3'] = this.data[i].kfe[d]['k4'] = 0;
        for(var j = 0; j < height; j++) {
          if(this.data[i].neighbour[j]['sk1'] <= d)
            this.data[i].kfe[d]['k1']++;
          else
            this.data[i].kfe[d]['k2']++;
          if(this.data[i].neighbour[j]['sk2'] <= d)
            this.data[i].kfe[d]['k3']++;
          else
            this.data[i].kfe[d]['k4']++;
        }
        //console.log(this.data[i].kfe[d]['k3']);
        this.data[i].kfe[d]['d1'] = this.data[i].kfe[d]['k1'] / height;
        this.data[i].kfe[d]['alpha'] = this.data[i].kfe[d]['k2'] / height;
        this.data[i].kfe[d]['beta'] = this.data[i].kfe[d]['k3'] / height;
        this.data[i].kfe[d]['d2'] = this.data[i].kfe[d]['k4'] / height;
        //console.log(this.data[i].kfe[d]['alpha']);
        var criterion = this.shannonKfe;
        if(this.options.kfeType != 'shannon')
          criterion = this.kulbakKfe;
        this.data[i].kfe[d]['kfe'] = criterion(
          this.data[i].kfe[d]['alpha'],
          this.data[i].kfe[d]['beta'],
          this.data[i].kfe[d]['d1'],
          this.data[i].kfe[d]['d2']
        );
        //console.log(d + ' ' + this.data[i].kfe[d]['kfe']);
      }
    }
  },
  // Виведення точнісних характеристик
  printCharacteristics: function(selector){
    $(selector).empty();
    for(var i = 0; i < this.data.length; i++) {
      var dmax = this.data[i].codeDistance[this.data[i].neighbour['nb']];
      $(selector).append('<table id="characteristics-table-'+i+'" />');
      var table = $('#characteristics-table-'+i);
      jQuery(table).jqGrid({
        datatype: "local",
        height: "auto",
        colNames: ["D", "K1", "K2", "K3", "K4", "D1", "alpha", "D2", "beta", "КФЕ"],
        colModel: [
          {name:'d', width: 25, sorttype: 'int'}, 
          {name:'k1', width: 45}, 
          {name:'k2', width: 45}, 
          {name:'k3', width: 45}, 
          {name:'k4', width: 45}, 
          {name:'d1', width: 45}, 
          {name:'alpha', width: 45}, 
          {name:'d2', width: 45}, 
          {name:'beta', width: 45}, 
          {name:'kfe', width: 170}
        ],
        caption: "Точнісні характеристики класу №" + +(i+1),
        rowNum: dmax,
        hiddengrid: true
      });
      for(var d = 0; d < dmax; d++) {
        jQuery(table).jqGrid('addRowData',d,
          {
            d: d,
            k1: this.data[i].kfe[d]['k1'],
            k2: this.data[i].kfe[d]['k2'],
            k3: this.data[i].kfe[d]['k3'],
            k4: this.data[i].kfe[d]['k4'],
            d1: this.data[i].kfe[d]['d1'],
            alpha: this.data[i].kfe[d]['alpha'],
            d2: this.data[i].kfe[d]['d2'],
            beta: this.data[i].kfe[d]['beta'],
            kfe: this.data[i].kfe[d]['kfe']
          }
        );
      }
    }
  },
  // Обчислення оптимального радіуса
  optimalRadius: function(){
    for(var i = 0; i < this.data.length; i++) {
      this.data[i].trainingData = Object();
      this.data[i].trainingData.d = 0;
      this.data[i].trainingData.kfe = 0;
      var dmax = this.data[i].codeDistance[this.data[i].neighbour['nb']];
      for(var d = 0; d < dmax; d++) {
        if(this.data[i].kfe[d]['d1'] >= 0.5 && this.data[i].kfe[d]['d2'] >= 0.5) {
          if(this.data[i].kfe[d]['kfe'] > this.data[i].trainingData.kfe)
          {
            this.data[i].trainingData.kfe = this.data[i].kfe[d]['kfe'];
            this.data[i].trainingData.d = d;
          }
        }
      }
      //console.log('kfe = ' + dataBase.trainingData[i].kfe + ', d = ' + dataBase.trainingData[i].d);
      //jQuery(table).jqGrid('addRowData',i+1,{klas: i+1, kfe: dataBase.trainingData[i].kfe, d: dataBase.trainingData[i].d});
    }
  },
  printOptimalRadius: function(selector) {
    // Printing table:
    $(selector).html('<table id="radius-table" />');
    var table = $('#radius-table');
    jQuery(table).jqGrid({
      datatype: "local",
      height: "auto",
      colNames: ["Клас", "КФЕ", "Оптимальний радіус"],
      colModel: [
        {name:'klas', width: 50}, 
        {name:'kfe', width: 200},
        {name:'d', width: 200}
      ],
      caption: "Оптимальні радіуси"
    });
    for(var i = 0; i < this.data.length; i++) {
      jQuery(table).jqGrid('addRowData',i+1,{klas: i+1, kfe: this.data[i].trainingData.kfe, d: this.data[i].trainingData.d});
    }
  },
  // Процес оптимізації радіусу
  drawOptimization: function(selector){
    $(selector).empty();
    $(selector).accordion('destroy');
    for(var i = 0; i < this.data.length; i++) {
      $(selector).append('<h3><a href="#class'+(i+1)+'">Графік для '+(i+1)+'-го класу</a></h3><div id="optimization-container-'+i+'" style="width: 488px; height: 300px; margin: 0 auto"></div>');
      var dmax = this.data[i].codeDistance[this.data[i].neighbour['nb']];
      var categories = Array(), data = Object();
      data.main = Array();
      data.sel = Array();
      for(var d = 0; d < dmax; d++) {
        if(this.data[i].kfe[d]['d1'] >= 0.5 && this.data[i].kfe[d]['d2'] >= 0.5) {
          data.sel[d] = this.data[i].kfe[d]['kfe'];
          data.main[d] = 0;
        }
        else {
          data.sel[d] = 0;
          data.main[d] = this.data[i].kfe[d]['kfe'];
        }
      }
      var chart;
      chart = new Highcharts.Chart({
        chart: {
          renderTo: 'optimization-container-'+i,
          defaultSeriesType: 'column',
          zoomType: 'xy'
        },
        title: {text: 'Залежність КФЕ від радіусу'},
        subtitle: {
          text: 'для класу №' + +(i+1)
        },
        xAxis: { min: -1, title: {text: 'Радіус'} },
        yAxis: { min: 0, title: { text: 'КФЕ' } },
        tooltip: {
          formatter: function() {
            return 'E(' + this.x +') = '+ this.y;
          }
        },
        plotOptions: {
          column: {
            pointPadding: 0.01,
            groupPadding: 0.01,
            borderWidth: 0
          },
          series: {
              stacking: 'normal'
          }
        },
        series: [{
          name: 'Не робоча область',
          data: data.main
        }, {
          name: 'Робоча область',
          data: data.sel
        }]
      });
    }
    $(selector).accordion({
      navigation: true,
      autoHeight: false
    });
  }
});