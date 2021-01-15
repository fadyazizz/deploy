//Require Mongoose
const mongoose = require('mongoose')

//Define a schema
const Schema = mongoose.Schema

const department = new Schema({
  name: String,
  facultyName: String,
  headOfDepartmentId: String,
  staff: Array,
  courses: Array,
})

const departmentModel = mongoose.model('department', department)

module.exports = { departmentModel }
