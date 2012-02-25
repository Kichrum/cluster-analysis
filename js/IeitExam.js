/**
  * Клас екзамену ІЕІТ
  */
var IeitExam = jQuery.Class.create({
  init: function(options) {
    this.options = jQuery.extend({
          training: Object(),
          classNum: 1,
          examResults: $(document),
          implementation: 1
        }, options);
    $(this.options.examResults).empty();
    var num = this.options.classNum,
      implementation = this.options.implementation;
    this.training = this.options.training;
    this.mu = Array();
    this.maxMuNum = 0;
    var print = '';
    print += '<ul>';
    for(var i = 0; i < this.options.training.data.length; i++) {
      var sum = 0;
      for(var j = 0; j < this.training.data[num].binaryMatrix.length; j++) {
        sum += ((this.training.data[num].binaryMatrix[j][implementation] + this.training.data[i].etalonVector[j] == 1) ? 1 : 0);
      }
      this.mu[i] = 1 - sum/this.training.data[i].trainingData.d;
      if(this.mu[i] > this.mu[this.maxMuNum])
        this.maxMuNum = i;
      print += '<li>Функція належності ' + (i+1) + '-му класу = ' + this.mu[i] + '</li>';
    }
    print += '</ul> <p><strong><i>Висновок:</i> Реалізація ';
    if(this.mu[this.maxMuNum] >= 0)
      print += 'належить до ' + (this.maxMuNum+1) + '-го';
    else
      print += 'не належить жодному';
    print += ' класу.</strong></p>';
    
    $(this.options.examResults).append(print);
  }
});