// grab the things we need
const mongoose = require('mongoose'),
      Schema = mongoose.Schema,
      request = require('request');

// create a schema
var rateSchema = new Schema({
  coin: String,
  price: Number,
  rate: Number,
  created_at: Date
});

// the schema is useless so far
// we need to create a model using it
function rates(){
  var Rate = mongoose.model('Rate', rateSchema),
      pollTime = 30000,
      saveTime = 300000,
      coinData = [],
      lastTime = [];

  var getRates = function(coins){
    request('https://poloniex.com/public?command=returnTicker', function(error, response, ticker){
      ticker = JSON.parse(ticker);
      coins.forEach(function(coin){

        if( ! (coin in coinData) ){
          coinData[coin]=[];
          coinData[coin]['rate'] =  0;
          coinData[coin]['price'] =  0;
          coinData[coin]['num'] =  0;
          lastTime[coin] = new Date();
        }

        request('https://poloniex.com/public?command=returnLoanOrders&currency='+coin,function(error,response,body){
          
          body = JSON.parse(body);

          coinData[coin]['num']++;
          coinData[coin]['price'] += parseFloat( ticker[(coin === 'BTC' ? 'USDT_BTC' : 'BTC_' + coin  )]['last'] );
          coinData[coin]['rate'] += Math.min.apply(null, body['offers'].map( function(offer){ return parseFloat( offer.rate ); }));

          if( new Date() - lastTime[coin] > saveTime ){

            coinData[coin]['price'] /= coinData[coin]['num'];
            coinData[coin]['rate'] /= coinData[coin]['num'];

            console.log('Saving '+ coin + ' ' + coinData[coin]['price'] + ' ' + coinData[coin]['rate'] + '...');

            var rate = new Rate({
              coin : coin,
              price: coinData[coin]['price'],
              rate: coinData[coin]['rate'],
              created_at: new Date()
            });
            
            rate.save(function(err){
              if(err){ console.log('Save error: ' + err ); }
            });

            coinData[coin]['price'] = coinData[coin]['rate'] = coinData[coin]['num'] = 0;
            lastTime[coin] = new Date();
          }
        });
      });
    });
    setTimeout(function(){ getRates(coins); }, pollTime);
  };

  this.Rate = Rate;
  this.getRates = getRates;
}

// make this available to our users in our Node applications
module.exports = rates;