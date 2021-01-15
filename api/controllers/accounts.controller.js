const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const staffModel = require('../../models/staff')
const attendanceModel = require('../../models/attendance')
const { signingKey, salt } = require('../../config/keys')
const statusCodes = require('../constants/statusCodes')
const {
  emailNotFound,
  incorrectPassword,
  youCannotSignInAfter,
  youCannotSignInBefore,
  OnlyHoursTill7Pm,
  SignOutWithouSignIn,
  SignInLaterThanSignUp,
  CannotSignInMoreThanOnce,
  CannotSignOutMoreThanOnce,
  SignInEarlierThanSignUp,
  signInOutFriday,
  youAreNotAHR,
} = require('../errorCodes')
const { response } = require('express')
const tokenModel = require('../../models/token')

const hodRequestsModel = require('../../models/hodRequests')
const days = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
]
const viewProfile = async (req, res, next) => {
  try {
    const id = req.data.id
    const staffFound = await staffModel.findOne({ id: id })
    if (!staffFound) {
      return res.json({
        error: 'user not found',
        statuscode: statusCodes.userNotFound,
      })
    }

    return res.json({
      name: staffFound.name,
      salary: staffFound.salary,
      email: staffFound.email,
      role: staffFound.role,
      dayoff: staffFound.dayoff,
      departmentName: staffFound.departmentName,
      office: staffFound.locationName,
      roleOfAcademicMember: staffFound.roleOfAcademicMember,
      role: staffFound.role,
      //annualLeaveBalance: staffFound.annualLeaveBalance,
      //accidentalLeaveRemainingDays: staffFound.accidentalLeaveRemainingDays,
      statuscode: statusCodes.success,
    })
  } catch (exception) {
    //console.log(exception)
    return res.json({
      error: 'Something went wrong',
      statuscode: statusCodes.unknown,
    })
  }
}
const logIn = async (req, res, next) => {
  try {
    const email = req.body.email
    const password = req.body.password
    const emailfound = await staffModel.findOne({ email: email })
    // console.log('ba3d el call', emailfound)
    if (!emailfound) {
      return res.json({ error: 'email not found', statuscode: emailNotFound })
    }
    const comparePass = bcrypt.compareSync(password, emailfound.password)
    if (!comparePass) {
      return res.json({
        error: 'wrong email or password',
        statuscode: incorrectPassword,
      })
    }
    var payLoad = {}
    if (emailfound.roleOfAcademicMember) {
      payLoad = {
        id: emailfound.id,
        name: emailfound.name,
        email: emailfound.email,
        gender: emailfound.gender,
        role: emailfound.role,
        dayoff: emailfound.dayoff,
        courses: emailfound.courses,
        department: emailfound.departmentName,
        roleOfAcademicMember: emailfound.roleOfAcademicMember,
      }
    } else {
      payLoad = {
        id: emailfound.id,
        name: emailfound.name,
        email: emailfound.email,
        gender: emailfound.gender,
        role: emailfound.role,
        dayoff: emailfound.dayoff,
      }
    }

    const token = jwt.sign(payLoad, signingKey, { expiresIn: '24h' })

    return res.json({ token, payLoad, statuscode: statusCodes.success })
  } catch (exception) {
    console.log(exception)
    return res.json({
      error: 'Something went wrong',
      statuscode: statusCodes.unknown,
    })
  }
}

const logout = async (req, res, next) => {
  try {
    //console.log(token)
    await tokenModel.create({ token: req.headers.authorization })
    return res.json({
      message: "You've been logged out successfully",
      statuscode: statusCodes.success,
    })
  } catch (exception) {
    console.log(exception)
    return res.json({
      error: 'Something went wrong1111',
      statuscode: statusCodes.unknown,
    })
  }
}

const signIn = async (req, res, next) => {
  try {
    const user = req.data
    const date = new Date(req.body.date)
    const startHour = req.body.startHour
    console.log(date)
    if (days[date.getUTCDay()] == user.dayoff) {
      console.log('here')
      const findCompensation = await hodRequestsModel.find({
        requesterId: user.id,
        used: false,
        status: 'accepted',
        typeOfRequest: 'compensationLeave',
      })
      findCompensation.forEach(async (compensation) => {
        const dateCompensation = new Date(
          compensation.year,
          compensation.month - 1,
          compensation.day
        )
        if (dateCompensation < date) {
          await hodRequestsModel.update(
            { _id: compensation._id },
            {
              used: true,
            }
          )
          await attendanceModel.create({
            day: compensation.day,
            month: compensation.month,
            status: 'compensationLeave',
            totalHours: 0,
            totalMinutes: 0,
            staffId: user.id,
          })
        }
      })
    }
    console.error(date)

    if (days[date.getUTCDay()] == 'Friday') {
      return res.json({
        error: 'you are trying to signIn on friday !',
        statuscode: signInOutFriday,
      })
    }
    if (startHour < 7) {
      return res.json({
        error: 'you can not signIn before 7 am',
        statuscode: youCannotSignInBefore,
      })
    }
    if (startHour >= 19) {
      return res.json({
        error: 'you can not signIn after 7 pm',
        statuscode: youCannotSignInAfter,
      })
    }
    const attendanceFound = await attendanceModel.findOne({
      staffId: user.id,
      day: date.getDate(),
      month: date.getMonth() + 1,
    })

    if (!attendanceFound) {
      await attendanceModel.create({
        day: date.getDate(),
        month: date.getMonth() + 1,
        status: 'attended',
        startHour: req.body.startHour,
        startMinute: req.body.startMinute,
        totalHours: 0,
        totalMinutes: 0,
        staffId: user.id,
      })
    } else {
      if (!attendanceFound.endHour && !attendanceFound.endMinute) {
        return res.json({
          error: 'you cannot signIn more than once without signOut',
          statuscode: CannotSignInMoreThanOnce,
        })
      }
      const tempTimeStart = req.body.startHour * 60 + req.body.startMinute
      const tempTimeEnd =
        attendanceFound.endHour * 60 + attendanceFound.endMinute

      if (tempTimeEnd >= tempTimeStart) {
        return res.json({
          error: 'signIn time is before last signOut time',
          statuscode: SignInEarlierThanSignUp,
        })
      }

      await attendanceModel.update(
        {
          staffId: user.id,
          day: date.getDate(),
          month: date.getMonth() + 1,
        },
        {
          endHour: undefined,
          startHour: req.body.startHour,
          endMinute: undefined,
          startMinute: req.body.startMinute,
        }
      )
    }
    return res.json({ statuscode: statusCodes.success, message: 'success' })
  } catch (exception) {
    console.log(exception)
    return res.json({
      error: 'Something went wrong',
      statuscode: statusCodes.unknown,
    })
  }
}

const signOut = async (req, res, next) => {
  try {
    const user = req.data
    const endHour = req.body.endHour
    const date = new Date(req.body.date)

    if (days[date.getUTCDay()] == 'Friday') {
      return res.json({
        error: 'you are trying to signIn on friday !',
        statuscode: signInOutFriday,
      })
    }
    if (endHour < 7) {
      return res.json({
        error: 'you can not signOut before 7 am',
        statuscode: youCannotSignInBefore,
      })
    }

    const foundSignIn = await attendanceModel.findOne({
      staffId: user.id,
      day: date.getDate(),
      month: date.getMonth() + 1,
    })
    if (!foundSignIn) {
      return res.json({
        error: 'you cannot signOut without signingIn',
        statuscode: SignOutWithouSignIn,
      })
    }
    if (foundSignIn.endMinute || foundSignIn.endHour) {
      return res.json({
        error: 'you cannot signOut more than once without signIn',
        statuscode: CannotSignOutMoreThanOnce,
      })
    }
    // console.log(endHour > 19)
    if (endHour >= 19) {
      const recordToBeUpdated = await attendanceModel.findOne({
        staffId: user.id,
        day: date.getDate(),
        month: date.getMonth() + 1,
      })

      //console.log(DateOld.getDate())
      const hoursOfDay = 19 - recordToBeUpdated.startHour

      //const minutes = 60 - recordToBeUpdated.startMinute + req.body.endMinute
      await attendanceModel.findByIdAndUpdate(
        { _id: recordToBeUpdated._id },
        {
          totalHours: hoursOfDay + recordToBeUpdated.totalHours,
          endHour: req.body.endHour,
          endMinute: 0,
        }
      )
      return res.json({
        statuscode: statusCodes.success,

        message: 'only hours till 7pm will be included',
      })
    }

    const recordToBeUpdated = await attendanceModel.findOne({
      staffId: user.id,
      day: date.getDate(),
      month: date.getMonth() + 1,
    })
    // console.log(recordToBeUpdated, 'recordtobeupdated')

    const timeStarting =
      recordToBeUpdated.startHour * 60 + recordToBeUpdated.startMinute
    const timeEnding = endHour * 60 + req.body.endMinute
    if (timeStarting > timeEnding) {
      return res.json({
        error: 'sign out time Cannot be before signIn',
        statuscode: SignInLaterThanSignUp,
      })
    }

    const hoursOfDay = Math.floor((timeEnding - timeStarting) / 60)
    const minutes = (timeEnding - timeStarting) % 60

    await attendanceModel.findByIdAndUpdate(
      { _id: recordToBeUpdated._id },
      {
        totalHours: hoursOfDay + recordToBeUpdated.totalHours,
        totalMinutes: minutes + recordToBeUpdated.totalMinutes,
        endHour: req.body.endHour,
        endMinute: req.body.endMinute,
      }
    )
    return res.json({
      statuscode: statusCodes.success,

      message: 'success',
    })
  } catch (exception) {
    console.log(exception)
    return res.json({
      error: 'Something went wrong',
      statuscode: statusCodes.unknown,
    })
  }
}

const viewAttendanceRecords = async (req, res, next) => {
  try {
    const user = req.data
    if (req.body.month) {
      const attendanceRecords = await attendanceModel.find({
        staffId: user.id,
        month: req.body.month,
      })
      return res.json({ statuscode: statusCodes.success, attendanceRecords })
    } else {
      const date = new Date()
      if (date.getDate() < 11) {
        date.setMonth(date.getUTCMonth() - 1)
        date.setDate(11)
        const allRecordsPrevoiusMonth = await attendanceModel.find(
          {
            staffId: user.id,
            day: { $gte: 11 },
            month: date.getUTCMonth() + 1,
          },
          [],
          { sort: { day: 1 } }
        )
        console.log(allRecordsPrevoiusMonth)
        const allRecordsThisMonth = await attendanceModel.find(
          {
            staffId: user.id,
            day: { $lte: new Date().getUTCDate() },
            month: new Date().getUTCMonth() + 1,
          },
          [],
          { sort: { day: 1 } }
        )
        console.log(allRecordsThisMonth)
        res.json({
          message: 'success',
          statuscode: statusCodes.success,
          attendanceRecords: allRecordsPrevoiusMonth.concat(
            allRecordsThisMonth
          ),
        })
      } else {
        const allRecords = await attendanceModel.find(
          {
            staffId: user.id,
            day: { $lte: date.getUTCDate(), $gte: 11 },
            month: date.getUTCMonth() + 1,
          },
          [],
          { sort: { day: 1 } }
        )
        res.json({
          message: 'success',
          statuscode: statusCodes.success,
          attendanceRecords: allRecords,
        })
      }
    }
  } catch (exception) {
    console.log(exception)
    return res.json({
      error: 'Something went wrong',
      statuscode: statusCodes.unknown,
    })
  }
}

const viewMissingDays = async (req, res) => {
  try {
    const user = req.data
    const dayOff = req.data.dayoff
    const date = new Date()
    const dataToReturn = []
    //hat mel shahr el fat le delwa2ty
    console.log(date.getDate())
    console.log(date.getUTCDate())
    if (date.getDate() < 11) {
      //test for 7owar previous month for jan

      date.setMonth(date.getUTCMonth() - 1)
      date.setDate(11)
      // console.log(date)
      //console.log(date.getUTCMonth(), date.getUTCDate())
      const startDate = new Date(2020, 11, 1)
      const testingDate = new Date()
      //console.log(testingDate.getDate())
      const dateDiff =
        (testingDate.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
      for (var i = 12; i < dateDiff + 12; i++) {
        const Date1 = new Date(date.getUTCFullYear(), date.getUTCMonth(), i)

        // console.log(Date1, Date1.getUTCDate(), '---')
        if (days[Date1.getUTCDay()] == 'Friday') {
          continue
        }

        if (days[Date1.getUTCDay()] !== dayOff) {
          const recordFound = await attendanceModel.findOne({
            staffId: user.id,
            day: Date1.getUTCDate(),
            month: Date1.getUTCMonth() + 1,
          })
          if (!recordFound) {
            dataToReturn.push({
              message: 'you have a missing day',
              date: Date1,
            })
          }
        }
      }
    } else {
      for (var i = 12; i <= date.getDate() + 1; i++) {
        const tempDate = new Date(
          date.getFullYear(),
          date.getMonth(),
          i,
          0,
          0,
          0
        )

        if (days[tempDate.getUTCDay()] == 'Friday') {
          continue
        }

        if (days[tempDate.getUTCDay()] !== dayOff) {
          const recordFound = await attendanceModel.findOne({
            staffId: user.id,
            day: tempDate.getUTCDate(),
            month: tempDate.getUTCMonth() + 1,
          })

          if (!recordFound) {
            dataToReturn.push({
              message: 'you have a missing day',
              date: tempDate,
            })
          }
        }
      }
    }

    return res.json({
      statuscode: statusCodes.success,

      missingDays: dataToReturn,
    })
  } catch (exception) {
    console.log(exception)
    return res.json({
      error: 'Something went wrong',
      statuscode: statusCodes.unknown,
    })
  }
}
const viewMissingHours = async (req, res, next) => {
  try {
    const user = req.data
    const date = new Date()
    const previousDate = new Date()
    let diff = 0
    previousDate.setMonth(date.getUTCMonth() - 1)
    // previousDatedate.setDate(11)
    let totalmissingHours = 0
    let totalmissingMinutes = 0
    let minutesInDay = 8 * 60 + 24

    if (date.getUTCDate() < 11) {
      //dont forget to return it back to date
      const attendanceRecordsOfPreviousMonth = await attendanceModel.find({
        staffId: user.id,
        day: { $gte: 11 },
        month: previousDate.getUTCMonth() + 1,
        status: 'attended',
      })
      //  console.log(attendanceRecordsOfPreviousMonth)

      let minutesInDay = 8 * 60 + 24
      attendanceRecordsOfPreviousMonth.forEach((attendanceRecord) => {
        let hours = attendanceRecord.totalHours
        let minutes = attendanceRecord.totalMinutes + hours * 60
        if (!hours && !minutes) {
          hours = 0
          minutes = 0
        }

        diff = diff + minutesInDay - minutes
      })
      //console.log(diff)
      const attendanceRecordsThisMonth = await attendanceModel.find({
        staffId: user.id,
        day: { $lte: date.getUTCDate() },
        month: date.getUTCMonth() + 1,
        status: 'attended',
      })
      // console.log(attendanceRecordsThisMonth)

      attendanceRecordsThisMonth.forEach((attendanceRecord) => {
        let hours = attendanceRecord.totalHours
        let minutes = attendanceRecord.totalMinutes + hours * 60
        if (!hours && !minutes) {
          hours = 0
          minutes = 0
        }
        diff = diff + minutesInDay - minutes
      })
      // console.log(diff)
    } else {
      const attendanceRecordsThisMonth = await attendanceModel.find({
        staffId: user.id,
        day: { $lte: date.getUTCDate(), $gte: 11 },
        month: date.getUTCMonth() + 1,
        status: 'attended',
      })
      console.log(attendanceRecordsThisMonth)
      attendanceRecordsThisMonth.forEach((attendanceRecord) => {
        let hours = attendanceRecord.totalHours
        let minutes = attendanceRecord.totalMinutes + hours * 60
        if (!hours && !minutes) {
          hours = 0
          minutes = 0
        }
        diff = diff + minutesInDay - minutes
        console.log(diff, minutes)
      })
      console.log(diff)
    }

    if (diff > 0) {
      diff = diff / 60
      diff = Math.round(diff * 100) / 100
      res.json({
        message: 'you have missing hours',
        Hours: diff,
        statuscode: statusCodes.success,
        code: -1,
      })
    } else {
      if (diff < 0) {
        diff = Math.abs(diff / 60)
        diff = Math.round(diff * 100) / 100
        res.json({
          message: 'you have extra hours',
          Hours: diff,
          statuscode: statusCodes.success,
          code: 1,
        })
      } else {
        res.json({
          message: 'you have no missing or extra hours',
          Hours: 0,
          statuscode: statusCodes.success,
          code: 0,
        })
      }
    }
  } catch (exception) {
    console.log(exception)
    return res.json({
      error: 'Something went wrong',
      statuscode: statusCodes.unknown,
    })
  }
}

const UpdateProfile = async (req, res, next) => {
  try {
    const user = req.data
    const dataToBe = {}

    if (req.body.location) {
      if (user.role != 'HR') {
        return res.json({
          error: 'you Are Not A HR',
          statuscode: youAreNotAHR,
        })
      }
      await staffModel.update(
        {
          id: user.id,
        },
        {
          location: req.body.location,
        }
      )
    }

    if (req.body.salary) {
      if (user.role != 'HR') {
        return res.json({
          error: 'you Are Not A HR',
          statuscode: youAreNotAHR,
        })
      }
      await staffModel.update(
        {
          id: user.id,
        },
        {
          salary: req.body.salary,
        }
      )
    }

    if (req.body.email) {
      await staffModel.update(
        {
          id: user.id,
        },
        {
          email: req.body.email,
        }
      )
    }

    const UpdateMess = 'Your Profile has been updated successfully'

    return res.json({ UpdateMess, statuscode: statusCodes.success })
  } catch (exception) {
    //console.log(exception)
    return res.json({
      error: 'Something went wrong',
      statuscode: statusCodes.unknown,
    })
  }
}

const ResetPassword = async (req, res, next) => {
  try {
    const user = req.data

    console.log(user.id)
    const staffFound = await staffModel.findOne({ email: user.email })
    console.log(staffFound)
    const comparePass = bcrypt.compareSync(
      req.body.oldPassword,
      staffFound.password
    )

    if (comparePass) {
      if (req.body.newPassword == req.body.confirmationNewPassword) {
        const saltKey = bcrypt.genSaltSync(salt)
        const hashedpassword = bcrypt.hashSync(req.body.newPassword, saltKey)

        await staffModel.update(
          {
            email: req.data.email,
          },
          {
            password: hashedpassword,
          }
        )
        const UpdateMess = 'Your password has been updated successfully'

        return res.json({ UpdateMess, statuscode: statusCodes.success })
      } else {
        return res.json({
          error: 'incorrectPassword',
          statuscode: statusCodes.incorrectPassword,
        })
      }
    } else {
      return res.json({
        error: 'incorrectPassword',
        statuscode: statusCodes.incorrectPassword,
      })
    }
  } catch (exception) {
    //console.log(exception)
    return res.json({
      error: 'Something went wrong',
      statuscode: statusCodes.unknown,
    })
  }
}

module.exports = {
  logIn,
  viewProfile,
  signIn,
  signOut,
  viewAttendanceRecords,
  viewMissingDays,
  viewMissingHours,
  ResetPassword,

  UpdateProfile,
  logout,
}
