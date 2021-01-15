//Require Mongoose
const mongoose = require('mongoose')

//Define a schema
const Schema = mongoose.Schema

const schedule = new Schema({
  staffId: String,
  slotName: {
    type: Number,
    enum: [1, 2, 3, 4, 5],
  },

  day: {
    type: String,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Saturday', 'Sunday'],
  },
  typeOfSlot: { type: String, enum: ['lab', 'tutorial', 'lecture'] },
  location: String,
  timing: String,
  courseCode: String,
})

const scheduleModel = mongoose.model('schedule', schedule)

module.exports = scheduleModel
