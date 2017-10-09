const mongoose = require('mongoose');

var connection_string =  process.env.MONGODB_URI || 'localhost:27017/ratebot';

mongoose.connect(connection_string);

module.exports = mongoose;