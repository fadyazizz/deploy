const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const { salt } = require('../../config/keys')
const { coursesModel } = require('../../models/courses')
const { departmentModel } = require('../../models/department')
const locationModel = require('../../models/location')
const staffModel = require('../../models/staff')
const facultyModel = require('../../models/faculty')
const scheduleModel = require('../../models/schedule')
const attendanceModel = require('../../models/attendance')
const { AcademicMember } = require('../enums')
const counterModel = require('../../models/counters')
const { date } = require('joi')

const populate = async () => {
  // dont forget populate hr
  await dropTables()
  await populateForAnnualLeave()
  await populateAttendance()

  //await populateForAnnualLeave()

  await staffModel.deleteOne({ id: 'hr-1' })
  await populateStaff()
  await staffModel.deleteOne({ id: 'hr-1' })
  populateStaff()
  // populateLocation()
  // populateCourse()
  // populateDepartment()
  // populateFaculty()
  // populateSchedule()
  // populateCounter()
}
const dropTables = async () => {
  console.log('dropping tables')
  drop('staffmembers')
  drop('courses')
  drop('departments')
  drop('faculties')
  drop('locations')
  drop('schedules')
  // drop('counters')
}
const drop = async (name) => {
  await mongoose.connection.db.dropCollection(name, function (err, result) {
    if (err) {
      console.log(`error delete collection ${name}`)
    } else {
      console.log(`delete collection ${name} success`)
    }
  })
}

// testing missing hours

// testing annual leave

const staff1 = [
  {
    id: 'hr-1',
    name: 'Mohamed Ali',
    gender: 'male',
    email: 'mohamed.ali@gmail.com',
    password: '123456',
    salary: 1200,
    role: 'HR',
    dayoff: 'Saturday',
    startWorkDay: 'Sunday',
    annualLeaveBalance: 6,
  },
]
const staffannualLeave = [
  {
    id: 'ac-1',
    name: 'Ahmed',
    gender: 'male',
    email: 'ahmed.a@blabla.com',
    password: '123456',
    salary: 12,
    role: 'AcademicMember',
    dayoff: 'Thursday',
    startWorkDay: 'Sunday',
    annualLeaveBalance: 1.5,
    departmentName: 'MET',
    roleOfAcademicMember: 'TA',
  },
  {
    id: 'ac-6',
    name: 'Ahmed',
    gender: 'male',
    email: 'ahmed.aa@blabla.com',
    password: '123456',
    salary: 12,
    role: 'AcademicMember',
    dayoff: 'Thursday',
    startWorkDay: 'Sunday',
    annualLeaveBalance: 1.5,
    departmentName: 'MET',
    roleOfAcademicMember: 'CourseInstructor',
  },
  {
    id: 'ac-2',
    name: 'Mohammed',
    gender: 'male',
    email: 'mo.a@blabla.com',
    password: '123456',
    salary: 12,
    role: AcademicMember,
    departmentName: 'MET',
    dayoff: 'Thursday',
    roleOfAcademicMember: 'TA',

    annualLeaveBalance: 6,
    roleOfAcademicMember: 'TA',
  },
  {
    id: 'ac-3',
    name: 'fady',
    gender: 'male',
    email: 'fady.a@blabla.com',
    password: '123456',
    salary: 12,
    role: AcademicMember,
    dayoff: 'Thursday',

    annualLeaveBalance: 6,
    departmentName: 'MET',
    roleOfAcademicMember: 'TA',
  },
  {
    id: 'ac-4',
    name: 'kero',
    gender: 'female',
    email: 'kero.a@blabla.com',
    password: '123456',
    salary: 12,
    role: AcademicMember,
    dayoff: 'Thursday',

    annualLeaveBalance: 1.5,
    departmentName: 'MET',
    roleOfAcademicMember: 'TA',
  },
  {
    id: 'ac-5',
    name: 'head',
    gender: 'male',
    email: 'head@blabla.com',
    password: '123456',
    salary: 12,
    role: AcademicMember,
    dayoff: 'Thursday',

    annualLeaveBalance: 6,
    departmentName: 'MET',
    roleOfAcademicMember: 'HeadOfDepartment',
  },
]
const scheduleannualLeave = [
  {
    staffId: 'ac-1',
    slotName: 1,
    day: 'Wednesday',
    typeOfSlot: 'tutorial',
    location: 'c2.888',
    courseCode: '501',
    timing: '8:30 till 10:00',
  },
  {
    staffId: 'ac-1',
    slotName: 3,
    day: 'Wednesday',
    typeOfSlot: 'tutorial',
    location: 'c2.888',
    courseCode: '501',
    timing: '8:30 till 10:00',
  },
  {
    staffId: 'ac-1',
    slotName: 4,
    day: 'Wednesday',
    typeOfSlot: 'tutorial',
    location: 'c2.888',
    courseCode: '501',
    timing: '8:30 till 10:00',
  },
  {
    staffId: 'ac-2',
    slotName: 1,
    day: 'Wednesday',
    typeOfSlot: 'tutorial',
    location: 'c2.888',
    courseCode: '501',
    timing: '8:30 till 10:00',
  },
  {
    staffId: 'ac-2',
    slotName: 2,
    day: 'Wednesday',
    typeOfSlot: 'tutorial',
    location: 'c2.888',
    courseCode: '501',
    timing: '8:30 till 10:00',
  },
  {
    staffId: 'ac-3',
    slotName: 3,
    day: 'Wednesday',
    typeOfSlot: 'tutorial',
    location: 'c2.888',
    courseCode: '501',
    timing: '8:30 till 10:00',
  },
  {
    staffId: 'ac-4',
    slotName: 5,
    day: 'Wednesday',
    typeOfSlot: 'tutorial',
    location: 'c2.888',
    courseCode: '501',
    timing: '8:30 till 10:00',
  },
]
const courseannualLeave = [
  {
    name: 'DB1',
    code: '501',
    creditHours: 6,
    staffId: ['ac-1', 'ac-2', 'ac-3', 'ac-4', 'ac-6'],
  },
  { name: 'DB2', code: '502', creditHours: 6, staffId: ['ac-2'] },
]
const departmentannualLeave = [
  {
    name: 'MET',

    headOfDepartmentId: 'ac-5',
  },
]
const populateAttendance = async () => {
  const Date1 = new Date(2020, 10, 11)
  const testingDate = new Date()
  //console.log(testingDate.getDate())
  const dateDiff =
    (testingDate.getTime() - Date1.getTime()) / (1000 * 60 * 60 * 24)

  for (let i = 12; i < dateDiff + 12; i++) {
    // console.log('aaaaaaaaaaaaaaa')
    const newDate = new Date(2020, 10, i, 0, 0, 0)
    //console.log(newDate)
    await attendanceModel.create({
      staffId: 'ac-4',
      day: newDate.getUTCDate(),
      month: newDate.getUTCMonth() + 1,
      status: 'attended',
      totalMinutes: 24,
      totalHours: 8,
    })
  }
}

const populateForAnnualLeave = async () => {
  const saltKey = bcrypt.genSaltSync(salt)

  staffannualLeave.forEach(async (staff) => {
    staff.password = bcrypt.hashSync(staff.password, saltKey)
  })
  await staffModel.create(staffannualLeave)

  await scheduleModel.create(scheduleannualLeave)

  await coursesModel.create(courseannualLeave)

  await departmentModel.create(departmentannualLeave)
}
const populateStaff = async () => {
  const saltKey = bcrypt.genSaltSync(salt)

  staff1.forEach(async (staff) => {
    staff.password = bcrypt.hashSync(staff.password, saltKey)
    await staffModel.create(staff)
  })
}

const months = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]
const days = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
]

module.exports = { populate, dropTables }
