//Require Mongoose
const { number } = require('joi')
const mongoose = require('mongoose')

//Define a schema
const Schema = mongoose.Schema

const courses = new Schema({
  name: String,
  code: String,
  creditHours: Number,
  staffId: Array,
  courseCoordinatorId: String, 
  courseInstructorId: String,
  totalSlots: Number,
  signedSlot: Number,
  courseCoverage: Number,
})

const coursesModel = mongoose.model('courses', courses)

module.exports = { coursesModel }
