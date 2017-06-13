const mongoose = require('mongoose'),
      Schema = mongoose.Schema,
      request = require('request');

mongoose.Promise = global.Promise;

var rateSchema = new Schema({
  coin: String,
  rate: Number,
  created_at: Date
});

function rates(){

  var Rate = mongoose.model('Rate', rateSchema),
      coinData = [];

  var getRates = function(coins, pollTime, saveTime){

    coins.forEach(function(coin){

      if( ! (coin in coinData) ){
        coinData[coin]=[];
        coinData[coin]['rate'] =  0;
        coinData[coin]['num'] =  0;
        coinData[coin]['lastTime'] = new Date();
      }

      request('https://poloniex.com/public?command=returnLoanOrders&currency='+coin,function(error,response,body){
        
        if(error){
          console.log(error);
          return;
        }

        body = JSON.parse(body);

        coinData[coin]['num']++;
        coinData[coin]['rate'] += Math.min.apply(null, body['offers'].map( function(offer){ return parseFloat( offer.rate ); }));

        if( new Date() - coinData[coin]['lastTime'] > saveTime ){

          coinData[coin]['rate'] /= coinData[coin]['num'];

          var rate = new Rate({
            coin : coin,
            rate: coinData[coin]['rate'],
            created_at: new Date()
          });
          
          rate.save(function(err, doc){
            if(err){ console.log('Save error: ' + err ); }
            else{ console.log( doc.created_at + ' Saved '+ coin + ' @ ' + doc.rate ); }
          });

          coinData[coin]['rate'] = coinData[coin]['num'] = 0;
          coinData[coin]['lastTime'] = new Date();
        }
      });
    });

    setTimeout(function(){ getRates(coins, pollTime, saveTime); }, pollTime);
  };

  this.Rate = Rate;
  this.getRates = getRates;
}

module.exports = rates;