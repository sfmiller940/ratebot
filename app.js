"use strict"

const coins        = ['STR','BTC','BTS','CLAM','DOGE','DASH','LTC','MAID','XMR','XRP','ETH','FCT'],
      env          = process.env,
      cluster      = require('cluster'),
      request      = require('request'),
      path         = require('path'),
      express      = require('express'),
      bodyParser   = require('body-parser'),
      mongoose     = require('./config/db'),
      ratesModel   = require('./models/rates');

var rates = new ratesModel();
if( env.workerIndex == 0 || cluster.isMaster ){
  rates.getRates(coins);
}

var app = express();

app
  
  .use([
    bodyParser.json(),
    express.static(path.join(__dirname, 'public')),
  ])

  .get('/health', function(req, res){
    res.writeHead(200);
    res.end('Healthy.');
  })

  .get('/coins', function(req, res){
    res.json(coins);
  })

  .get('/:coin', function(req, res){
    rates.Rate.find({ coin: req.params.coin }, function (err, docs) {
      res.json(docs);
    });
  })

  .listen( env.PORT || env.OPENSHIFT_NODEJS_PORT || 3000, env.IP || env.OPENSHIFT_NODEJS_IP || 'localhost');

console.log('Server running.');