// grab the things we need
const mongoose = require('mongoose'),
      Schema = mongoose.Schema,
      request = require('request');

// create a schema
var rateSchema = new Schema({
  coin: String,
  price: Number,
  offers:Array,
  demands:Array,
  created_at: Date
});

// the schema is useless so far
// we need to create a model using it
function rates(){
  var Rate = mongoose.model('Rate', rateSchema);

  var getRates = function(coins){
    request('https://poloniex.com/public?command=returnTicker', function(error, response, ticker){
      ticker = JSON.parse(ticker);
      coins.forEach(function(coin){
        request('https://poloniex.com/public?command=returnLoanOrders&currency='+coin,function(error,response,body){
          body = JSON.parse(body);
          var rate = new Rate({
            coin : coin,
            price: ticker[(coin === 'BTC' ? 'USDT_BTC' : 'BTC_' + coin  )]['last'],
            offers: body['offers'],
            demands: body['demands'],
            created_at: new Date()
          });
          rate.save(function(err){
            if(err){ console.log('Save error: ' + err ); }
            else{ console.log('Rate saved: ' + coin ); }
          });
        });
      });
    });
    setTimeout(function(){ getRates(coins); }, 60000);
  };

  this.Rate = Rate;
  this.getRates = getRates;
}

// make this available to our users in our Node applications
module.exports = rates;