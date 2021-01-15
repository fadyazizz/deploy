const mongoose = require('mongoose')

//Define a schema
const Schema = mongoose.Schema

const uploads = new Schema({
  requesterId: String,

  document: {
    data: Buffer,
    contentType: String,
  },
})

const uploadsModel = mongoose.model('uploads', uploads)

module.exports = uploadsModel
