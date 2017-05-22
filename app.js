"use strict"

const coins        = ['STR','BTC','BTS','CLAM','DOGE','DASH','LTC','MAID','XMR','XRP','ETH','FCT'],
      env          = process.env,
      cluster      = require('cluster'),
      request      = require('request'),
      path         = require('path'),
      express      = require('express'),
      bodyParser   = require('body-parser'),
      mongoose     = require('./config/db'),
      fs           = require('fs'),
      ratesModel   = require('./models/rates');

var rates = new ratesModel();
if( env.workerIndex == 0){
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
    res.end();
  })

  .get('/', function(req,res){
    fs.readFile('./public/index.html', function (err, html) {
        if (err) {
            throw err; 
        }       
        res.writeHeader(200, {"Content-Type": "text/html"});  
        res.write(html);  
        res.end();  
    });
  })

  .get('/coins', function(req, res){
    res.json(coins);
  })

  .get('/:coin', function(req, res){
    rates.Rate.find({ coin: req.params.coin }, function (err, docs) {
      res.json(docs);
    });
  })

  .listen(env.OPENSHIFT_NODEJS_PORT || 3000, env.OPENSHIFT_NODEJS_IP || 'localhost');

console.log('Server running.');