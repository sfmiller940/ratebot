"use strict"
const env          = process.env,
      request      = require('request'),
      path         = require('path'),
      bodyParser   = require('body-parser'),
      express      = require('express'),
      app          = express();

function startServer(coins, rates){

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
      rates.Rate.find({ coin: req.params.coin }, 'rate created_at -_id', function (err, docs) {
        res.json(docs);
      });
    })

    .listen( env.PORT || env.OPENSHIFT_NODEJS_PORT || 3000, env.IP || env.OPENSHIFT_NODEJS_IP || 'localhost');
    
    console.log('Server running.');
};

module.exports = startServer;