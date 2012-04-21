/**
  * Кластеризація ІЕІТ
  */
var IeitCluster = jQuery.Class.create({
  init: function(data) {
    this.ieitData = data;
    //this.realizations = Array();
    
    // Всі навчальні матриці в один масив:
    this.source = Array();
    for(var i = 0; i < this.ieitData.length; i++) {
      for(var j = 0; j < this.ieitData[i].trainingMatrix.length; j++) {
        //this.source[i][j] = Array();
        var srcNum = i * this.ieitData[(i>0?i-1:0)].trainingMatrix.length + j;
        this.source[srcNum] = Array();
        for(var k = 0; k < this.ieitData[i].trainingMatrix[j].length; k++) {
          //console.log(srcNum + ', ' + k);
          this.source[srcNum][k] = this.ieitData[i].trainingMatrix[j][k];
        }
      }
    }
    
    // Масив відстаней
    this.dist = Array();
    var cur = 0;
    
    for(var i = 0; i < this.source.length; i++) {
      for(var j = 0; j < i; j++) {
        //var k = this.dist.length + 1;
        //cur = this.dist.length;
        this.dist[cur] = Object();
        this.dist[cur].dis = 0;
        this.dist[cur].n1 = i;
        this.dist[cur].n2 = j;
        for(var k = 0; k < this.ieitData[0].trainingMatrix[0].length; k++)
          this.dist[cur].dis += Math.pow(this.source[i][k] - this.source[j][k], 2);
        this.dist[cur].dis = Math.sqrt(this.dist[cur].dis);
        //console.log(this.dist[cur].dis)
        cur++;
      }
    }
    
    // Сортування за зростанням:
    function sortByDis(a, b) {
      if(a.dis < b.dis)
        return -1;
      if(a.dis > b.dis)
        return 1;
      return 0;
    }
    this.dist.sort(sortByDis);
    
    
    // Формування кластерів:
    this.clusters = Array();
    var amount = this.ieitData.length * this.ieitData[0].trainingMatrix.length;
    this.clusters[0] = Array();
    for(var i = 0; i < amount; i++) {
      this.clusters[0][i] = i; // - перший рівень - номер класу дорівнює номеру реалізації для всіх кластерів
    }
    for(var i = 1; i < this.dist.length; i++) { // - цикл по відстаням
      this.clusters[i] = Array();
      for(var j = 0; j < amount; j++) { // - цикл по реалізаціям некласифікованої навчальної матриці
        this.clusters[i][j] = this.clusters[i - 1][j];
      }
      var n1 = this.dist[i - 1].n1;
      n1 = this.clusters[i][n1];
      var n2 = this.dist[i - 1].n2;
      n2 = this.clusters[i][n2];
      var num = Math.min(n1, n2); // - нумерація реалізацій після об'єднання в один новий кластер
      for(var k = 0; k < amount; k++)
        if((this.clusters[i][k] == n1) || (this.clusters[i][k] == n2))
          this.clusters[i][k] = num;
    }
    //for(var i = 1169; i < 1173/*this.clusters.length*/; i++) {
    for(var i = 0; i < this.clusters.length; i++) {
      this.training(i);
    }
  },
  // TODO: REMOVE THIS
  // Вибір підходящих рівнів, в яких більше 2 кластерів та не менше 3 реалізацій в кожному
  workingLevel: function() {
    var minImplementations = 3, minClusters = 2;
    //var workingLevels = Array();
    var k = 0;
    this.workingClusters = Array();
    //this.workingLevels = Array();
    for(var i = 0; i < this.clusters.length; i++) {
      var clustersCount = 0;
      var implementationsCount = 0;
      
      var cluster = this.clusters[i].concat();
      cluster.sort(function(a, b){ return a - b; });
      for(var j = 0; j < cluster.length-1; j++) {
        if(cluster[j] == cluster[j+1])
          implementationsCount++;
        else {
          if(implementationsCount < minImplementations) {
            implementationsCount = 0;
            clustersCount = 0;
            break;
          }
          else {
            if(j != cluster.length-2) {
              clustersCount++;
              implementationsCount = 1;
            }
            else {
              implementationsCount = 0;
              clustersCount = 0;
              break;
            }
          }
        }
      }
      if(clustersCount >= minClusters) {
        this.workingClusters[k] = Object();
        this.workingClusters[k].clusters = Array();
        this.workingClusters[k].level = i;
        var f = 0;
        for(var j = 0; j < cluster.length - 1; j++) {
          if(cluster[j] != cluster[j+1])
            this.workingClusters[k].clusters[f++] = cluster[j];
          this.workingClusters[k].clusters[f] = cluster[j+1];
        }
        k++;
      }
    }
  },
  // << removed before this
  // Побудова навчальних матриць для проведення оптимізації рівня
  training: function(level) {
    var implCount = Array();
    //implCount[0] = 3;
    // Мінімальна кількість реалізацій в кожному кластері
    for(var i = 0; i < this.clusters[level].length; i++) {
      implCount[i] = 0;
    }
    for(var i = 0; i < this.clusters[level].length; i++) {
      //console.log(this.clusters[level][i]);
      implCount[this.clusters[level][i]]++;
    }
    var min = Math.max.apply(Math, implCount), zeros = 0/*, cluster = Array(), k = 0*/;
    for(var i = 0; i < this.clusters[level].length; i++) {
      if(implCount[i] != 0 && implCount[i] < min)
        min = implCount[i];
      if(implCount[i] == 0)
        zeros++;
    }
    var minImplementations = 3, minClusters = 2; // Робоча область: більше 2 кластерів та не менше 3 реалізацій в кожному
    if(min >= minImplementations && this.clusters[level].length - zeros > minClusters)
      true;
      //console.log('working...');
    var clusters = this.clusters[level].concat();
    var trainingMatrix = Array(), x = 0, y = 0;
    for(var i = 0; i < clusters.length; i++) {
      if(clusters[i] >= 0) {
        var cur = clusters[i];
        trainingMatrix[x] = Array();
        for(var j = i; j < clusters.length; j++) {
          if(clusters[j] >= 0 && clusters[j] == cur) {
            if(y < min)
              trainingMatrix[x][y] = this.source[j].concat();
            clusters[j] = -1;
            y++;
          }
        }
        x++;
        y = 0;
      }
    }
    this.newIeitData = Array();
    for(var i = 0; i < trainingMatrix.length; i++) {
      this.newIeitData[i] = new IeitClass(trainingMatrix, true);
    }
    
    var options = {}; // !!!
    options = jQuery.extend({
          selectionLevelSel: '#sel-level',
          admissionSel: '#admission',
          kfeType: 'shannon'
        }, options);
    this.trainingParallel = new IeitTraining(this.newIeitData, {
      selectionLevel: $(options.selectionLevelSel).val(),
      admission: $(options.admissionSel).val(),
      kfeType: options.kfeType,
      optimization: 'parallel'
    });
    if(this.trainingParallel.optimized.kfe > 0)
      console.log(level + ': ', this.trainingParallel.optimized.kfe);
    //console.log(this.trainingParallel);
    
  }
});
