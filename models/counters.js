//Require Mongoose
const mongoose = require('mongoose')

//Define a schema
const Schema = mongoose.Schema

const counter =new Schema({
 name:String,
 counter:Number,
})

const counterModel = mongoose.model('counter', counter)

module.exports = counterModel