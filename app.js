"use strict"

const request      = require('request'),
      env          = process.env,
      path         = require('path'),
      express      = require('express'),
      bodyParser   = require('body-parser'),
      mongoose     = require('mongoose'),
      rates        = require('./models/rates');

// default to a 'localhost' configuration:
var connection_string = '127.0.0.1:27017/ratebot';
// if OPENSHIFT env variables are present, use the available connection info:
if(process.env.OPENSHIFT_MONGODB_DB_PASSWORD){
  connection_string = process.env.OPENSHIFT_MONGODB_DB_USERNAME + ":" +
  process.env.OPENSHIFT_MONGODB_DB_PASSWORD + "@" +
  process.env.OPENSHIFT_MONGODB_DB_HOST + ':' +
  process.env.OPENSHIFT_MONGODB_DB_PORT + '/' +
  process.env.OPENSHIFT_APP_NAME;
}

getRates();
function getRates(){
  console.log('Rates!');
  request('https://poloniex.com/public?command=returnLoanOrders&currency=BTC',function(error,response,body){
    var rate = new rates({
      coin : 'BTC',
      offers:body['offers'],
      demands:body['demands']
    });
    rate.save(function(err){
      console.log('Save error: ' + err);
    });
  });
  setTimeout(getRates, 60000);
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

  .get('/', function(req, res){
    request('https://poloniex.com/public?command=returnLoanOrders&currency=BTC',function(error,response,body){
      res.end(body);
    });
  })

  .listen(env.NODE_PORT || 3000, env.NODE_IP || 'localhost');

console.log('Server running.');