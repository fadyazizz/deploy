//Import the mongoose module
const mongoose = require('mongoose')
const { mongoURI } = require('./keys')
const { populate, dropTables } = require('../api/helpers/helpers')
const connectDB = async () => {
  const uri = mongoURI
  await mongoose
    .connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(async () => {
      //await dropTables()
      await populate()

      console.log('MongoDB Connected…')
    })
    .catch((err) => console.log(err))
}

module.exports = { connectDB }
