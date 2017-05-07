// grab the things we need
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// create a schema
var rateSchema = new Schema({
  coin: String,
  offers:Array,
  demands:Array,
  created_at: Date
});

// the schema is useless so far
// we need to create a model using it
var Rate = mongoose.model('Rate', rateSchema);

// make this available to our users in our Node applications
module.exports = Rate;