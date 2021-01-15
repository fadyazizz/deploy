//Require Mongoose
const { number } = require('joi')
var mongoose = require('mongoose')

//Define a schema
var Schema = mongoose.Schema

const SlotLinkingrequests = new Schema({
   
  courseCode: String, //1
  reqType: {
    type: String,
    enum: [
      'slotLinking',
    ],
  },
  comment: String,
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending',
  },
  staffId: String, //from array to string//2
  desiredSlotName : { type :Number,
  enum: [1, 2, 3, 4, 5]},   //3
  location : String , //6
  desiredSlotday :{ type :String, //4
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Saturday', 'Sunday']},
  desiredSlotType:{ type :String, //5
    enum: ['lab', 'tutorial', 'lecture'] },
})

var requestSlotLinkingModel = mongoose.model('SlotLinkingrequests', SlotLinkingrequests)

module.exports = requestSlotLinkingModel
