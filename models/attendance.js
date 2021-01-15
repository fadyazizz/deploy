//Require Mongoose
const { number } = require('joi')
const mongoose = require('mongoose')

//Define a schema
const Schema = mongoose.Schema

const attendance = new Schema({
  month: Number,
  day: Number,
  date: Date,
  status: {
    type: String,
    enum: [
      'attended',
      'annualLeave',
      'accidentalLeave',
      'sickLeave',
      'maternityLeave',
      'compensationLeave',
    ],
    default: 'attended',
  },
  startHour: Number,
  endHour: Number,
  startMinute: Number,
  endMinute: Number,
  totalMinutes: Number,
  totalHours: Number,
  staffId: String,
})

const attendanceModel = mongoose.model('attendance', attendance)

module.exports = attendanceModel
