//Require Mongoose
const mongoose = require('mongoose')

//Define a schema
const Schema = mongoose.Schema
const assignment = new Schema({
    staff_id:String,
    typeOfSlot: { type: String, enum: ['lab', 'tutorial', 'lecture'] },
    courseId: String,
    numberOfSlotsAssigned : Number
})



const assignmentModel = mongoose.model('assignment', assignment)

module.exports = assignmentModel
