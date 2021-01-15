//Require Mongoose
const mongoose = require('mongoose')
//Define a schema
const Schema = mongoose.Schema

const notification = new Schema({
  senderId: String,
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending',
  },

  viewedByReceiver: Boolean,
  viewedBySender: Boolean,
  replacerId: String,
  slot: String,
  typeOfSlot: { type: String, enum: ['lab', 'tutorial', 'lecture'] },
  month: Number,
  day: Number,
  year: Number,
  location: String,
  course: String,
})

const notificationModel = mongoose.model('notification', notification)

module.exports = notificationModel
