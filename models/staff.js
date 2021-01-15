//Require Mongoose
const mongoose = require('mongoose')
const attendanceModel = require('./attendance')
const { coursesModel } = require('./courses')
const { departmentModel } = require('./department')
const notificationModel = require('./notification')
const locationModel = require('./location')
const requestModel = require('./requestSlotLinking')
const scheduleModel = require('./schedule')
//Define a schema
const Schema = mongoose.Schema

const staffData = new Schema({
  id: String,
  name: String,
  gender: { type: String, enum: ['male', 'female'] },
  email: String,
  password: String,
  salary: Number,
  role: {
    type: String,
    enum: ['AcademicMember', 'HR'],
  },
  roleOfAcademicMember: {
    type: String,
    enum: ['HeadOfDepartment', 'CourseCoordinator', 'CourseInstructor', 'TA'],
  },
  dayoff: String,
  startWorkDay: String,
  annualLeaveBalance: Number,
  courses: Array,
  departmentName: String,
  locationName: String,
  notification: Array,
  request: Array,
})

const staffModel = mongoose.model('staffMembers', staffData)

module.exports = staffModel
