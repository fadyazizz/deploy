const express = require('express')
const cors = require('cors')
const cron = require('node-cron')
const allRoutes = require('express-list-endpoints')
const bodyParser = require('body-parser')
const { addAttendanceRecordsInDataBase } = require('./api/helpers/helpers')
const app = express()

app.use(express.json())

const { connectDB } = require('./config/dbConfig')

const accounts = require('./api/routers/accounts.router')
const academicMember = require('./api/routers/academicMembers.router')
const hr = require('./api/routers/hrMembers.router')
const courseInstructor = require('./api/routers/courseInstructor.router')
const courseCoordinator = require('./api/routers/courseCoordinator')
const { date } = require('joi')
const { AcademicMember } = require('./api/enums')
const hod = require('./api/routers/hodMembers.router')
// import db configuration
// const sequelize = require('./config/DBConfig')

// add other middleware

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use(cors())
const explore = (req, res) => {
  const routes = allRoutes(app)
  const result = {
    ServiceList: [],
  }

  routes.forEach((route) => {
    const name = route.path.split('/')[5]
    result.ServiceList.push({
      Service: {
        name,
        fullUrl: `${route.path}`,
      },
    })
  })
  return res.json(result)
}
//routes of accounts
app.use('/account', accounts)

//routes of hr
app.use('/hr', hr)

app.use('/courseInstructor', courseInstructor)
app.use('/courseCoordinator', courseCoordinator)
app.use('/academicMember', academicMember)
app.use('/hod', hod)

app.use('/explore', explore)

app.use('/courseInstructor', courseInstructor)

app.use('/academicMember', academicMember)

app.use((req, res) => {
  res.status(404).send({ err: 'No such url' })
})

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Origin', 'GET, POST, OPTIONS')
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, X-Auth-Token, Accept'
  )
  next()
})

connectDB()
const minute = (new Date().getMinutes() + 1) % 60
const hours = new Date().getHours()

// cron.schedule(`${minute} ${hours} * * *`, addAttendanceRecordsInDataBase)
if (process.env.NODE_ENV === 'production') {
  // Set static folder
  app.use(express.static('client/build'))

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'))
  })
}

const port = 7000
if (process.env.PORT) {
  app.listen(process.env.PORT, () =>
    console.log(`Server up and running on ${process.env.PORT}`)
  )
} else {
  app.listen(port, () => console.log(`Server up and running on ${port}`))
}

export default server
