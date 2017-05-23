const mongoose = require('mongoose');

// default to a 'localhost' configuration:
var connection_string = '127.0.0.1:27017/ratebot';
// if OPENSHIFT env variables are present, use the available connection info:
if(process.env.OPENSHIFT_MONGODB_DB_HOST){
  connection_string = 'mongodb://' +
  process.env.OPENSHIFT_MONGODB_DB_HOST + ':' +
  process.env.OPENSHIFT_MONGODB_DB_PORT;
}

mongoose.connect(connection_string);

module.exports = mongoose;