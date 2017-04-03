const mongoose = require('mongoose');
const config = require('../config.json');
const connectionUrl = 'mongodb://'+config.mongoConfig.host+':'+config.mongoConfig.port+'/'+config.mongoConfig.db;
mongoose.connect(connectionUrl);

const Schema = mongoose.Schema;

const genres = new Schema({
  id:  {type : Number,unique : true},
  name: {type : String, unique : true},
  date: { type: Date, default: Date.now }
});

const tracks = new Schema({
  id: {type : Number,unique : true},
  title: {type : String,unique : true},
  rating: Number,
  genres: [Number],
  date: {type: Date, default: Date.now },
});

module.exports = {
  genres : mongoose.model('genres', genres),
  tracks : mongoose.model('tracks', tracks)
};