"use strict"

const cluster = require('cluster'),
      stopSignals = [
        'SIGHUP', 'SIGINT', 'SIGQUIT', 'SIGILL', 'SIGTRAP', 'SIGABRT',
        'SIGBUS', 'SIGFPE', 'SIGUSR1', 'SIGSEGV', 'SIGUSR2', 'SIGTERM'
      ],
      production = process.env.NODE_ENV == 'production',
      mongoose = require('./config/db'),
      coins = ['STR','BTC','BTS','CLAM','DOGE','DASH','LTC','MAID','XMR','XRP','ETH','FCT'],
      ratesModel = require('./models/rates'),
      rates = new ratesModel(),
      startServer = require('./server.js'),
      pollTime = 30000,
      saveTime = 900000;

      var workers = [];

let stopping = false;

cluster.on('disconnect', function(worker) {
  if (production) {
    if (!stopping) {
      var newWorker = cluster.fork({'workerInd':workers[worker.id]});
      workers[newWorker.id] = workers[worker.id];
      delete workers[worker.id];
    }
  } else {
    process.exit(1);
  }
});

if (cluster.isMaster) {
  const workerCount = process.env.NODE_CLUSTER_WORKERS || 5;
  console.log(`Starting ${workerCount} workers...`);
  for (let i = 0; i < workerCount; i++) {
    var worker = cluster.fork({'workerInd':i});
    workers[worker.id] = i;
  }

  if (production) {
    stopSignals.forEach(function (signal) {
      process.on(signal, function () {
        console.log(`Got ${signal}, stopping workers...`);
        stopping = true;
        cluster.disconnect(function () {
          console.log('All workers stopped, exiting.');
          process.exit(0);
        });
      });
    });
  }
} else {
  startServer(coins, rates);
}