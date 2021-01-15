//Require Mongoose
const { number, array } = require('joi')
const mongoose = require('mongoose')

//Define a schema
const Schema = mongoose.Schema

const replacement = new Schema({
  month: Number,
  day: Number,
  year: Number,

  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending',
  },
  typeOfRequest: {
    type: String,
    enum: [
      'compensationLeave',
      'annualLeave',
      'changeDayOff',
      'sickLeave',
      'maternityLeave',
      'accidentalLeave',
    ],
  },

  requesterId: String,
  headId: String,
  replacements: Array,
  comment: String,
  reason: String,
  documentId: String,
  newDay: String,
  used: Boolean,
  viewBySender: Boolean,
})

const hodRequestsModel = mongoose.model('hodRequests', replacement)

module.exports = hodRequestsModel
