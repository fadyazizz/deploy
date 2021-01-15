//Require Mongoose
const mongoose = require('mongoose')
const { departmentModel } = require('./department')

//Define a schema
const Schema = mongoose.Schema

const faculty =new Schema({
 name:String,
 infoAboutFaculty:String,
})

const facultyModel = mongoose.model('faculty', faculty)

module.exports = facultyModel