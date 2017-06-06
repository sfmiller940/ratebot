"use strict"
const env          = process.env,
      request      = require('request'),
      path         = require('path'),
      bodyParser   = require('body-parser'),
      express      = require('express'),
      app          = express();

function startServer(coins, rates, pollTime, saveTime){

  if( env.workerInd == 0 ){
    rates.getRates(coins, pollTime, saveTime)
  }

  app
    .use([
      bodyParser.json(),
      express.static(path.join(__dirname, 'public')),
    ])

    .get('/health', function(req, res){
      res.writeHead(200);
      res.end('Healthy.');
    })

    .get('/rates', function(req, res){
      rates.Rate.aggregate(
        [ { $sort : { created_at: 1 } },
          { 
            $group:{ 
              _id: "$coin",
              rate: { $last: "$rate" }
            }
          },
          { $sort : { _id: 1 }}
        ]
        ,function(err, result){
          res.json(result);
        }
      );
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