const mongoose = require('mongoose')

const Schema = mongoose.Schema

const replacement = new Schema({
  month: Number,
  day: Number,
  year: Number,

  replacerId: String,
  slot: String,
  course: String,
  location: String,
  typeOFSlot: String,
})

const replacementsModel = mongoose.model('replacements', replacement)

module.exports = replacementsModel
