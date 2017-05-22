"use strict"

const coins        = ['STR','BTC','BTS','CLAM','DOGE','DASH','LTC','MAID','XMR','XRP','ETH','FCT'],
      request      = require('request'),
      env          = process.env,
      path         = require('path'),
      express      = require('express'),
      bodyParser   = require('body-parser'),
      mongoose     = require('./config/db'),
      ratesFn      = require('./models/rates');

var rates = new ratesFn();
rates.getRates(coins);

var app = express();

app
  
  .use([
    bodyParser.json(),
    express.static(path.join(__dirname, 'public')),
  ])

  .get('/health', function(req, res){
    res.writeHead(200);
    res.end();
  })

  .get('/', function(req, res){
    request('https://poloniex.com/public?command=returnTicker',function(error,response,body){
      res.end(body);
    });
  })

  .get('/:coin', function(req, res){
    rates.Rate.find({ coin: req.params.coin }, function (err, docs) {
        res.json(docs);
    });
  })

  .listen(env.NODE_PORT || 3000, env.NODE_IP || 'localhost');

console.log('Server running.');