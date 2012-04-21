/**
  * Клас навчання ІЕІТ
  */
var IeitTraining = jQuery.Class.create({
  init: function(data, options) {
    this.options = jQuery.extend({
          selectionLevel: 0.53,
          admission: 40,
          kfeType: 'shannon',
          optimization: 'basic'
        }, options);
    this.ieitData = data;
    //console.log(this.ieitData);
    this.data = Array();
    for(var i = 0; i < this.ieitData.length; i++) {
      this.data[i] = {};
    }
    
    this.selectionLevel = options.selectionLevel;
    this.admission = options.admission;
    
    if(options.optimization == 'parallel') {
      this.parallelOptimization();
    }
    else if(options.optimization == 'series') {
      this.seriesOptimization();
    }
    else {
      this.controlApprovalsBasic();
      this.trainingBasic();
    }
  },
  // Базовий алгоритм навчання
  trainingBasic: function() {
    this.binEtalon();
    this.codeDistance();
    this.neighbour();
    this.characteristics();
    this.optimalRadius();
  },
  // Створення масиву контрольних допусків
  controlApprovalsBasic: function() {
    //console.log(this.ieitData);
    for(var i = 0; i < this.ieitData.length; i++) {
      this.data[i].dk = Array();
      this.data[i].ndk = Array();
      this.data[i].vdk = Array();
      for(var j = 0; j < this.ieitData[i].trainingMatrix.length; j++) {
        var height = this.ieitData[i].trainingMatrix[j].length;
        this.data[i].dk[j] = 0;
        for(var k = 0; k < height; k++) {
          //console.log(k + ', ' + this.ieitData[0].trainingMatrix[j][k]);
          this.data[i].dk[j] += this.ieitData[0].trainingMatrix[j][k];
        }
        this.data[i].dk[j] /= height;
        this.data[i].dk[j] = Math.round(this.data[0].dk[j]);
        this.data[i].ndk[j] = this.data[0].dk[j] - this.admission;
        this.data[i].vdk[j] = this.data[0].dk[j] + +this.admission;
      }
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
      var height = this.data[i].binaryMatrix.length; //var height = this.data[i].binaryMatrix[0].length;
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
      
      // 2. Побудова матриці SK
      //for(var j = 0; j < this.data[i].binaryMatrix; j++) { // j < height???
      for(var j = 0; j < height; j++) { // j < height???
        var sk1 = 0, sk2 = 0;
        for(var k = 0; k < this.data[i].etalonVector.length; k++) {
          sk1 += (this.data[i].etalonVector[k] + +this.data[i].binaryMatrix[j][k]) % 2;
          sk2 += (this.data[i].etalonVector[k] + +this.data[this.data[i].neighbour['nb']].binaryMatrix[j][k]) % 2;
        }
        this.data[i].neighbour[j] = Array();
        this.data[i].neighbour[j]['sk1'] = sk1;
        this.data[i].neighbour[j]['sk2'] = sk2;
      }
    }
  },
  printSK: function() {
    // !!!
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
    //console.log('kulbak');
    alpha+=alpha?0:0.00001; // А чи можна так робити?...
    beta+=beta?0:0.00001; // І так... Бо інакше виходять розірвані графіки!
    return ( (d1+d2) && (alpha+beta)
      ? 0.5*(Math.log((d1+d2)/(alpha+beta))/Math.log(2.0))*(d1+d2-alpha-beta) :
      0);
  },
  // Обчислення точнісних характеристик
  characteristics: function(){
    for(var i = 0; i < this.data.length; i++) {
      var height = this.data[i].binaryMatrix.length; //var height = this.data[i].binaryMatrix[0].length;
      this.data[i].kfe = Array();
      for(var d = 0; d < height; d++) {
        this.data[i].kfe[d] = Array();
        this.data[i].kfe[d]['k1'] = this.data[i].kfe[d]['k2'] = this.data[i].kfe[d]['k3'] = this.data[i].kfe[d]['k4'] = 0;
        //for(var j = 0; j < this.data[i].neighbour.length; j++) { // height???
        for(var j = 0; j < height; j++) { // height???
          if(this.data[i].neighbour[j]['sk1'] <= d)
            this.data[i].kfe[d]['k1']++;
          else
            this.data[i].kfe[d]['k2']++;
          if(this.data[i].neighbour[j]['sk2'] <= d)
            this.data[i].kfe[d]['k3']++;
          else
            this.data[i].kfe[d]['k4']++;
        }
        this.data[i].kfe[d]['d1'] = this.data[i].kfe[d]['k1'] / height;
        this.data[i].kfe[d]['alpha'] = this.data[i].kfe[d]['k2'] / height;
        this.data[i].kfe[d]['beta'] = this.data[i].kfe[d]['k3'] / height;
        this.data[i].kfe[d]['d2'] = this.data[i].kfe[d]['k4'] / height;
        var criterion = this.shannonKfe;
        if(this.options.kfeType != 'shannon')
          criterion = this.kulbakKfe;
        this.data[i].kfe[d]['kfe'] = criterion(
          this.data[i].kfe[d]['alpha'],
          this.data[i].kfe[d]['beta'],
          this.data[i].kfe[d]['d1'],
          this.data[i].kfe[d]['d2']
        );
      }
    }
  },
  // Виведення точнісних характеристик
  printCharacteristics: function(selector){
    $(selector).empty();
    var tempRnd = Math.floor(Math.random()*1000);
    for(var i = 0; i < this.data.length; i++) {
      var height = this.data[i].binaryMatrix.length; //var height = this.data[i].binaryMatrix[0].length;
      $(selector).append('<table id="characteristics-table-'+tempRnd+'-'+i+'" />');
      var table = $('#characteristics-table-'+tempRnd+'-'+i);
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
        rowNum: height,
        hiddengrid: true
      });
      for(var d = 0; d < height; d++) {
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
      var height = this.data[i].binaryMatrix.length; // var height = this.data[i].binaryMatrix[0].length;
      for(var d = 0; d < height; d++) {
        if(this.data[i].kfe[d]['d1'] >= 0.5 && this.data[i].kfe[d]['d2'] >= 0.5) {
          if(this.data[i].kfe[d]['kfe'] > this.data[i].trainingData.kfe)
          {
            this.data[i].trainingData.kfe = this.data[i].kfe[d]['kfe'];
            this.data[i].trainingData.d = d;
          }
        }
      }
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
  // Процес оптимізації радіусу (базового алгоритму)
  drawOptimization: function(selector){
    $(selector).empty();
    $(selector).accordion('destroy');
    var tempRnd = Math.floor(Math.random()*1000);
    for(var i = 0; i < this.data.length; i++) {
      $(selector).append('<h3><a href="#class'+tempRnd+'-'+(i+1)+'">Графік для '+(i+1)+'-го класу</a></h3><div id="optimization-container-'+tempRnd+'-'+i+'" style="width: 488px; height: 300px; margin: 0 auto"></div>');
      var height = this.data[i].binaryMatrix.length; //var height = this.data[i].binaryMatrix[0].length;
      //var dmax = 100;//this.data[i].binaryMatrix[0][0].length; //this.data[i].codeDistance[this.data[i].neighbour['nb']];
      var categories = Array(), data = Object();
      data.main = Array();
      data.sel = Array();
      for(var d = 0; d < height; d++) {
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
          renderTo: 'optimization-container-'+tempRnd+'-'+i,
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
  },
  
  // Процес оптимізації за ітераціями
  drawIterations: function(selector){
    //$(selector).empty();
    //$(selector).accordion('destroy');
    //var tempRnd = Math.floor(Math.random()*1000);
    //for(var i = 0; i < this.data.length; i++) {
    $(selector).append('<div id="optimization-container-iterations" style="width: 488px; height: 300px; margin: 0 auto"></div>');
    //var height = this.data[0].binaryMatrix[0].length;
    //var dmax = 100;//this.data[i].binaryMatrix[0][0].length; //this.data[i].codeDistance[this.data[i].neighbour['nb']];
    var categories = Array(), data = Object();
    data.main = Array();
    data.sel = Array();
    for(var d = 0; d < this.ndelta; d++) {
      if(this.optimizationData[d].inArea == true) {
        data.sel[d] = this.optimizationData[d].kfe; //this.data[i].kfe[d]['kfe'];
        data.main[d] = 0;
      }
      else {
        data.sel[d] = 0;
        data.main[d] = this.optimizationData[d].kfe;
      }
    }
    var chart;
    chart = new Highcharts.Chart({
      chart: {
        renderTo: 'optimization-container-iterations',
        defaultSeriesType: 'column',
        zoomType: 'xy'
      },
      title: {text: 'Залежність КФЕ від дельта'},
      /*subtitle: {
        text: 'для класу №' + +(i+1)
      },*/
      xAxis: { min: -1, title: {text: 'Дельта'} },
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
    //}
    /*$(selector).accordion({
      navigation: true,
      autoHeight: false
    });*/
  },
  
  // Оптимізація
  // Створення масиву контрольних допусків для паралельної оптимізації
  controlApprovals: function() {
    var sum = 0;
    var cnt = 0;
    for(var j = 0; j < this.ieitData[0].trainingMatrix.length; j++) {
      for(var k = 0; k < this.ieitData[0].trainingMatrix[j].length; k++) {
        sum += this.ieitData[0].trainingMatrix[j][k];
        cnt++;
        //if(this.max < this.ieitData[i].trainingMatrix[j][k])
        //  this.max = this.ieitData[i].trainingMatrix[j][k];
        //if(this.min > this.ieitData[i].trainingMatrix[j][k])
        //  this.min = this.ieitData[i].trainingMatrix[j][k];
      }
    }
    var avg = sum / cnt;
    this.ndelta = 100; //Math.round(avg * 1.5); !!!
    //console.log(sum + ', ' + cnt + ', ' + avg);
    //console.log(this.ndelta);
    
    //console.log(this.max);
    
    for(var i = 0; i < this.ieitData.length; i++) {
      this.data[i].dk = Array();
      this.data[i].min = Array();
      this.data[i].max = Array();
      this.data[i].ndk = Array();
      this.data[i].vdk = Array();
      for(var j = 0; j < this.ieitData[i].trainingMatrix.length; j++) {
        var height = this.ieitData[i].trainingMatrix[j].length;
        this.data[i].dk[j] = 0;
        this.data[i].min[j] = this.ieitData[i].trainingMatrix[j][0];
        this.data[i].max[j] = this.ieitData[i].trainingMatrix[j][0];
        for(var k = 0; k < height; k++) {
          this.data[i].dk[j] += this.ieitData[i].trainingMatrix[j][k];
          if(this.ieitData[i].trainingMatrix[j][k] < this.data[i].min[j])
            this.data[i].min[j] = this.ieitData[i].trainingMatrix[j][k];
          if(this.ieitData[i].trainingMatrix[j][k] > this.data[i].max[j])
            this.data[i].max[j] = this.ieitData[i].trainingMatrix[j][k];
        }
        this.data[i].dk[j] /= height;
        this.data[i].dk[j] = Math.round(this.data[0].dk[j]);
        //this.data[i].ndk[j] = this.data[i].min[j];
        //this.data[i].vdk[j] = this.data[i].max[j];
        
        //this.data[i].vdk[j] = this.data[i].dk[j] + (this.data[i].max[j] - this.data[i].min[j]) / this.max * this.admission;
        //this.data[i].ndk[j] = this.data[i].dk[j] - (this.data[i].max[j] - this.data[i].min[j]) / this.max * this.admission;
        // don't need:
        this.data[i].vdk[j] = this.data[0].dk[j] + (this.data[0].max[j] - this.data[0].min[j]) / this.ndelta * this.admission;
        this.data[i].ndk[j] = this.data[0].dk[j] - (this.data[0].max[j] - this.data[0].min[j]) / this.ndelta * this.admission;
        //console.log(this.data[i].vdk[j] + '; ' + this.data[i].ndk[j]);
        /*
        
        data.vdk[i]:=data.mid[i]+ (data.vdn[i]-data.ndn[i])/data.N_delta*data.delta;
        data.ndk[i]:=data.mid[i]- (data.vdn[i]-data.ndn[i])/data.N_delta*data.delta;
        */
        
      }
      //break;
      //console.log('break'+i);
    }
  },
  // Паралельна оптимізація
  parallelOptimization: function() {
    var iterationsCount = 100;
    this.controlApprovals();
    /*
    for(var i = 0; i < this.ieitData.length; i++) {
      this.data[i].step = Array();
      for(var j = 0; j < this.ieitData[i].trainingMatrix.length; j++) {
        this.data[i].step[j] = (this.data[i].max[j] - this.data[i].min[j]) / (iterationsCount*2); // Визначення кроку стиснення
      }
    }
    */
    
    this.optimized = Object();
    this.optimized.kfe = 0;
    this.optimizationData = Array();
    for(var iteration = 0; iteration < iterationsCount; iteration++) {
      this.optimizationData[iteration] = Object();
      this.optimizationData[iteration].inArea = true;
      for(var i = 0; i < this.ieitData.length; i++) {
        for(var j = 0; j < this.ieitData[i].trainingMatrix.length; j++) {
          // this.data[i].ndk[j] = this.data[i].ndk[j] + +this.data[i].step[j];
          // this.data[i].vdk[j] = this.data[i].vdk[j] - this.data[i].step[j];
          this.data[i].vdk[j] = this.data[0].dk[j] + (this.data[0].max[j] - this.data[0].min[j]) / this.ndelta * iteration;
          this.data[i].ndk[j] = this.data[0].dk[j] - (this.data[0].max[j] - this.data[0].min[j]) / this.ndelta * iteration;
        }
      }
      this.trainingBasic();
      this.optimizationData[iteration].kfe = 0;
      for(var i = 0; i < this.ieitData.length; i++) {
        if(this.data[i].trainingData.kfe == 0)
          this.optimizationData[iteration].inArea = false;
        else
          this.optimizationData[iteration].kfe += this.data[i].trainingData.kfe;
      }
      //this.optimized.data[iteration].kfe = sum;
      if(this.optimizationData[iteration].inArea == true && this.optimizationData[iteration].kfe >= this.optimized.kfe) {
        this.optimized.kfe = this.optimizationData[iteration].kfe;
        this.optimized.data = Array();
        for(var i = 0; i < this.ieitData.length; i++) {
          this.optimized.data[i] = Object();
          this.optimized.data[i].ndk = this.data[i].ndk.concat();
          this.optimized.data[i].vdk = this.data[i].vdk.concat();
        }
      }
    }
    if(typeof(this.optimized.data) != 'undefined') {
      for(var i = 0; i < this.ieitData.length; i++) {
        this.optimized.kfe += this.data[i].trainingData.kfe
        this.data[i].ndk = this.optimized.data[i].ndk.concat();
        this.data[i].vdk = this.optimized.data[i].vdk.concat();
      }
      this.trainingBasic();
    }
  },
  seriesOptimization: function() {
    var iterationsCount = 100;
    this.controlApprovals();
    for(var i = 0; i < this.ieitData.length; i++) {
      this.data[i].step = Array();
      for(var j = 0; j < this.ieitData[i].trainingMatrix.length; j++) {
        this.data[i].step[j] = (this.data[i].max[j] - this.data[i].min[j]) / (iterationsCount*2); // Визначення кроку стиснення
      }
    }
    
    this.optimized = Object();
    this.optimized.kfe = 0;
    for(var matrix = 0; matrix < this.ieitData.length; matrix++) {
      for(var step = 0; step < this.ieitData[matrix].trainingMatrix.length; step++) {
        this.data[matrix].ndk[step] = this.data[matrix].ndk[step] + +this.data[matrix].step[step];
        this.data[matrix].vdk[step] = this.data[matrix].vdk[step] - this.data[matrix].step[step];          
        this.trainingBasic();
        var sum = 0;
        for(var i = 0; i < this.ieitData.length; i++) {
            sum += this.data[i].trainingData.kfe;
        }
        if(sum >= this.optimized.kfe) {
          this.optimized.kfe = sum;
          this.optimized.data = Array();
          for(var i = 0; i < this.ieitData.length; i++) {
            this.optimized.data[i] = Object();
            this.optimized.data[i].ndk = this.data[i].ndk.concat();
            this.optimized.data[i].vdk = this.data[i].vdk.concat();
          }
        }
      }
    }
    for(var i = 0; i < this.ieitData.length; i++) {
      this.optimized.kfe += this.data[i].trainingData.kfe
      this.data[i].ndk = this.optimized.data[i].ndk.concat();
      this.data[i].vdk = this.optimized.data[i].vdk.concat();
    }
    this.trainingBasic();
  }
});
