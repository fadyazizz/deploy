//Require Mongoose
const { string } = require('joi')
const mongoose = require('mongoose')

//Define a schema
const Schema = mongoose.Schema

const location = new Schema({
  location: String,
  capacity: Number,
  typeOfLocation: {
    type: String,
    enum: ['office', 'lab', 'tutorial', 'lectureHall'],
  },
})

const locationModel = mongoose.model('location', location)

module.exports = locationModel
