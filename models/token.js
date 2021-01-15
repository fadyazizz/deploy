const mongoose = require('mongoose')

//Define a schema
const Schema = mongoose.Schema

const token = new Schema({
  token:String
})

const tokenModel = mongoose.model('token', token)

module.exports = tokenModel