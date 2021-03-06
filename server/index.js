"use strict"
const env          = process.env,
      path         = require('path'),
      bodyParser   = require('body-parser'),
      express      = require('express'),
      app          = express();

function startServer(coins, rates ){

  if( env.workerInd == 0 ){
    rates.getRates(coins);
    return;
  }

  app

    .set('port', (process.env.PORT || 5000))

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

    .get('/:coin', function(req, res){
      rates.Rate.find({ coin: req.params.coin }, 'rate created_at -_id')
        .sort('created_at')
        .batchSize(100000)
        .exec(function (err, docs) {
          if(err) console.log(err);
          res.json(docs);
        }
      );
    })

  .listen(app.get('port'), function() {
    console.log('Ratebot running at http://localhost:'+app.get('port'));
  });
};

module.exports = startServer;