const statusCodes = require('../constants/statusCodes')
const staffModel = require('../../models/staff')
const fs = require('fs')
var path = require('path')
var multer = require('multer')

const {
  ReceiverDoesNotTeachThatCourse,
  courseNotFound,

  yastaAnaMash3ol,
  SenderDoesNotTeachThatCourse,
  ReceiverDoesNotExist,
  TaToTaAndDrToDr,
  DidNotNotifyAboutAllSlots,
  waitForNotifications,
  annualLeaveDepleted,
  ReceiverAndRequesterMustHaveSameDepartment,
  requestStillPending,
  dayHasPassed,
  sickDays,
  notapendingrequestocancel,
  notyourrequest,
  replacementRequestCantBeInThePast,
  noSlotWithProvidedInfo,
  youHaveTeachingObligationsForTheDay,
  locationNotFound,
} = require('../errorCodes')

const notificationModel = require('../../models/notification')
const scheduleModel = require('../../models/schedule')
const { coursesModel } = require('../../models/courses')
const { departmentModel } = require('../../models/department')
const hodRequestsModel = require('../../models/hodRequests')
const uploadsModel = require('../../models/uploads')
const days = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
]
const facultyModel = require('../../models/faculty')

const locationModel = require('../../models/location')

const { staffNotFound } = require('../errorCodes')

const requestSlotLinkingModel = require('../../models/requestSlotLinking')
const attendanceModel = require('../../models/attendance')
const replacementsModel = require('../../models/replacements')
const { success } = require('../constants/statusCodes')

const sendReplacementNotification = async (req, res, next) => {
  try {
    const user = req.data

    const replacerId = req.body.replacerId
    const date = new Date(req.body.date)
    if (date < new Date()) {
      return res.json({
        error:
          'you cannot send replacement request for a day in the past or the current date',
        statuscode: replacementRequestCantBeInThePast,
      })
    }
    const dayOfSlot = days[date.getUTCDay()]
    //console.log(dayOfSlot)
    //const course = req.body.course
    const slot = req.body.slot
    // const location = req.body.location
    const slotToBeReplaced = await scheduleModel.findOne({
      staffId: user.id,
      slotName: slot,
      day: dayOfSlot,
    })
    const sentRequestBefore = await notificationModel.findOne({
      senderId: user.id,
      day: date.getUTCDate(),
      month: date.getUTCMonth() + 1,
      slot: slot,
    })
    if (sentRequestBefore) {
      return res.json({
        error:
          'you have a request for this slot,you can only send requests for slots only once',
        statuscode: requestStillPending,
      })
    }

    if (!slotToBeReplaced) {
      return res.json({
        error: 'you dont have any slots with the provided info',
        day: dayOfSlot,
        slotNumber: slot,
        statuscode: noSlotWithProvidedInfo,
      })
    }
    const findReceiverCourses = await coursesModel.findOne({
      code: slotToBeReplaced.courseCode,
    })
    const receiver = await staffModel.findOne({ id: replacerId })

    if (!receiver) {
      return res.json({
        error: 'the id of satff to be notified is invalid',
        statuscode: ReceiverDoesNotExist,
      })
    }
    if (receiver.departmentName != user.department) {
      return res.json({
        error: 'both the receiver and requester should have same department',
        statuscode: ReceiverAndRequesterMustHaveSameDepartment,
      })
    }
    if (receiver.roleOfAcademicMember != user.roleOfAcademicMember) {
      return res.json({
        error:
          'only TA can send to TA, and an instructor can send to instructor',
        statuscode: TaToTaAndDrToDr,
      })
    }
    if (!findReceiverCourses) {
      return res.json({
        error:
          'the course taught in the provided slot is not found in table courses,please make sure the data in schedule table is consistent with courses table',
        statuscode: courseNotFound,
      })
    }

    const indexReceiver = findReceiverCourses.staffId.indexOf(replacerId)

    if (indexReceiver < 0) {
      return res.json({
        error:
          'this receiver does not teach that course, make sure data is consistent with course table',
        statuscode: ReceiverDoesNotTeachThatCourse,
      })
    }
    const findSenderCourses = await coursesModel.findOne({
      code: slotToBeReplaced.courseCode,
    })

    const indexSender = findSenderCourses.staffId.indexOf(user.id)
    if (indexSender < 0) {
      return res.json({
        error:
          'this Sender does not teach that course, make sure date is consistent with course table',
        statuscode: SenderDoesNotTeachThatCourse,
      })
    }
    const schedule = await scheduleModel.find({
      staffId: replacerId,
      day: dayOfSlot,
      slotName: slot,
    })

    if (schedule.length > 0) {
      return res.json({
        error: 'receiver is busy in that slot',
        statuscode: yastaAnaMash3ol,
      })
    }
    await notificationModel.create({
      senderId: user.id,
      day: date.getUTCDate(),
      month: date.getUTCMonth() + 1,
      year: date.getUTCFullYear(),
      replacerId,
      slot,
      dayOfWeek: dayOfSlot,
      course: slotToBeReplaced.courseCode,
      location: slotToBeReplaced.location,
      typeOfSlot: slotToBeReplaced.typeOfSlot,
      viewedByReceiver: false,
    })
    return res.json({ statuscode: statusCodes.success, message: 'success' })
  } catch (exception) {
    console.log(exception)
  }
}

const viewSchedule = async (req, res, next) => {
  // ------------------> view replacement TODO
  try {
    const staff_id = req.data.id
    const staff_role = req.data.role
    // console.log(staff_id)

    if (staff_role != 'AcademicMember') {
      return res.json({ error: 'You are not academic member ' })
    }

    const ScheuleFound = await scheduleModel.find({ staffId: staff_id })
    if (ScheuleFound.length == 0) {
      return res.json({ error: 'You have no schedule yet ' })
    } else {
      return res.json({ schedule: ScheuleFound, statuscode: success })
    }
  } catch (exception) {
    //console.log(exception)
    return res.json({
      error: 'Something went wrong',
      statuscode: statusCodes.unknown,
    })
  }
}

const sendAnnualLeaveRequest = async (req, res, next) => {
  try {
    const user = req.data
    const date = new Date(req.body.date)
    const dayOfSlot = days[date.getUTCDay()]
    const dept = await departmentModel.findOne({ name: req.data.department })
    const userData = await staffModel.findOne({ id: user.id })
    if (date < new Date()) {
      return res.json({
        error:
          'you can not take annual leave for a day in the past or the current day',
        statuscode: 25,
      })
    }

    if (!dept) {
      return res.json({
        error:
          'there is data inconsistency while testing please insert a document in the department table with department name equal to department that the user belongs to',
      })
    }
    // console.log(dept)
    if (!dept.headOfDepartmentId) {
      return res.json({
        error:
          'there is data inconsistency while testing please insert a document in the department table with a valid headOfDepartmentId ',
      })
    }
    //console.log(dayOfSlot)
    const findUser = await staffModel.findOne({ id: user.id })
    if (findUser.annualLeaveBalance < 1) {
      return res.json({
        error: 'you have depleted your annual leave balance',
        statuscode: annualLeaveDepleted,
      })
    }
    const foundRequest = await hodRequestsModel.findOne({
      requesterId: user.id,
      typeOfRequest: 'annualLeave',
      day: date.getUTCDate(),
      month: date.getUTCMonth() + 1,
      year: date.getUTCFullYear(),
    })

    if (foundRequest) {
      return res.json({
        error: 'you have already placed a request',
        statuscode: 26,
      })
    }
    const schedule = await scheduleModel.find({
      staffId: user.id,
      day: dayOfSlot,
    })
    if (schedule.length > 0) {
      const notifications = await notificationModel.find({
        senderId: user.id,
        day: date.getUTCDate(),
        month: date.getUTCMonth() + 1,
        year: date.getUTCFullYear(),
      })
      if (notifications.length != schedule.length) {
        return res.json({
          error:
            'you have teaching activities on that day and you still did not notify for all slots ',
          statuscode: DidNotNotifyAboutAllSlots,
        })
      }
      let allResolved = true
      notifications.forEach((notification) => {
        if (notification.status == 'pending') {
          allResolved = false
        }
      })
      if (!allResolved) {
        return res.json({
          error:
            'you must wait for all replacements requests to be either accepted/rejected',
          statuscode: waitForNotifications,
        })
      }
      const HOD = await departmentModel.findOne({ name: user.department })
      await hodRequestsModel.create({
        day: date.getUTCDate(),
        month: date.getUTCMonth() + 1,
        year: date.getUTCFullYear(),
        typeOfRequest: 'annualLeave',
        requesterId: user.id,
        headId: HOD.headOfDepartmentId,
        reason: req.body.reason,
        replacements: notifications,
      })
      return res.json({ statuscode: statusCodes.success, message: 'success' })
    } else {
      const HOD = await departmentModel.findOne({ name: user.department })
      await hodRequestsModel.create({
        day: date.getUTCDate(),
        month: date.getUTCMonth() + 1,
        year: date.getUTCFullYear(),
        typeOfRequest: 'annualLeave',
        requesterId: user.id,
        reason: req.body.reason,
        headId: HOD.headOfDepartmentId,
      })
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
const acceptReplacementRequest = async (req, res, next) => {
  try {
    const user = req.data
    const requestId = req.body.requestId
    const notificationFound = await notificationModel.findOne({
      _id: requestId,
    })
    if (!notificationFound) {
      return res.json({ error: 'invalid replacement request id' })
    }
    if (notificationFound.replacerId != user.id) {
      return res.json({
        error:
          'you cannot accept this request because it does not belong to you',
      })
    }
    await notificationModel.update(
      { _id: requestId },
      { status: 'accepted', viewedByReceiver: true, viewedBySender: false }
    )
    return res.json({ message: 'success', statuscode: statusCodes.success })
  } catch (exception) {
    console.log(exception)
    return res.json({
      error: 'Something went wrong',
      statuscode: statusCodes.unknown,
    })
  }
}
const rejectReplacementRequest = async (req, res, next) => {
  try {
    const user = req.data
    const requestId = req.body.requestId
    const notificationFound = await notificationModel.findOne({
      _id: requestId,
    })
    if (!notificationFound) {
      return res.json({ error: 'invalid replacement request id' })
    }
    if (notificationFound.replacerId != user.id) {
      return res.json({
        error:
          'you cannot reject this request because it does not belong to you',
      })
    }
    await notificationModel.update(
      { _id: requestId },
      { status: 'rejected', viewedByReceiver: true, viewedBySender: false }
    )
    return res.json({ message: 'success', statuscode: statusCodes.success })
  } catch (exception) {
    console.log(exception)
    return res.json({
      error: 'Something went wrong',
      statuscode: statusCodes.unknown,
    })
  }
}
const viewReplacementRequests = async (req, res, next) => {
  try {
    const AllReplacement = await notificationModel.find({
      replacerId: req.data.id,
    })
    return res.json({
      Requests: AllReplacement,
      statuscode: statusCodes.success,
    })
  } catch (exception) {
    console.log(exception)
    return res.json({
      error: 'Something went wrong',
      statuscode: statusCodes.unknown,
    })
  }
}
const sendCompensationLeave = async (req, res, next) => {
  try {
    const reason = req.body.reason
    const date = new Date(req.body.date)
    const dept = await departmentModel.findOne({ name: req.data.department })
    if (date < new Date()) {
      return res.json({
        error: 'you cannot send compensation leave for a day in the past',
        statuscode: dayHasPassed,
      })
    }
    if (!dept) {
      return res.json({
        error:
          'there is data inconsistency while testing please insert a document in the department table with department name equal to department that the user belongs to',
      })
    }
    // console.log(dept)
    if (!dept.headOfDepartmentId) {
      return res.json({
        error:
          'there is data inconsistency while testing please insert a document in the department table with a valid headOfDepartmentId ',
      })
    }
    await hodRequestsModel.create({
      day: date.getUTCDate(),
      month: date.getUTCMonth() + 1,
      year: date.getUTCFullYear(),
      typeOfRequest: 'compensationLeave',
      requesterId: req.data.id,
      headId: dept.headOfDepartmentId,
      reason: req.body.reason,
    })
    return res.json({ message: 'success', statuscode: statusCodes.success })
  } catch (exception) {
    console.log(exception)
    return res.json({
      error: 'Something went wrong',
      statuscode: statusCodes.unknown,
    })
  }
}

const uploadDocument = async (req, res, next) => {
  try {
    const user = req.data
    const document = req.file
    if (!document) {
      return res.json({ error: 'no file was attached' })
    }
    // console.log(document.Buffer)
    var data1
    fs.readFile(req.file.path, async function (err, data) {
      if (err) throw err
      // data will contain your file contents
      data1 = data
      //console.log('the data is : ', data1)
      await uploadsModel.create({
        requesterId: user.id,
        document: {
          data: data1,
          contentType: 'image/png',
        },
      })
    })
  } catch (exception) {
    console.log(exception)
    return res.json({
      error: 'Something went wrong',
      statuscode: statusCodes.unknown,
    })
  }
  return res.json({ message: 'success', statuscode: statusCodes.success })
}
const sendSickLeave = async (req, res, next) => {
  try {
    const currentDate = new Date()
    const dateOfSickness = new Date(req.body.dateOfSickness)
    const uploadId = req.body.uploadId
    if (currentDate < dateOfSickness) {
      return res.json({
        error: 'you can not send a sick leave for a day in the future',
        statuscode: 20,
      })
    }
    const upload = await uploadsModel.findOne({ _id: uploadId })
    if (!upload) {
      return res.json({
        error:
          'either you did not upload document first, or the uploadId is invalid',
      })
    }
    const checkBelongs = await uploadsModel.findOne({
      _id: uploadId,
      requesterId: req.data.id,
    })
    if (!checkBelongs) {
      return res.json({
        error:
          'although the upload is valid, but it does not belong to you, this is because you entered a correct uploadid but this uploadid does not belong to that user',
      })
    }
    const dateDiff =
      (currentDate.getTime() - dateOfSickness.getTime()) / (1000 * 60 * 60 * 24)
    if (dateDiff > 3) {
      return res.json({
        error: 'you cannot send sickLeave 3 days after the targeted day',
        statuscode: sickDays,
      })
    }
    const dept = await departmentModel.findOne({ name: req.data.department })
    if (!dept) {
      return res.json({
        error:
          'there is data inconsistency while testing please insert a document in the department table with department name equal to department that the user belongs to',
      })
    }
    // console.log(dept)
    if (!dept.headOfDepartmentId) {
      return res.json({
        error:
          'there is data inconsistency while testing please insert a document in the department table with a valid headOfDepartmentId ',
      })
    }
    await hodRequestsModel.create({
      day: dateOfSickness.getUTCDate(),
      month: dateOfSickness.getUTCMonth() + 1,
      year: dateOfSickness.getUTCFullYear(),
      typeOfRequest: 'sickLeave',
      requesterId: req.data.id,
      headId: dept.headOfDepartmentId,
      reason: req.body.reason,
      documentId: uploadId,
    })
    return res.json({ message: 'success', statuscode: statusCodes.success })
  } catch (exception) {
    console.log(exception)
    return res.json({
      error: 'Something went wrong',
      statuscode: statusCodes.unknown,
    })
  }
}

const sendMaternityLeave = async (req, res, next) => {
  try {
    const user = req.data
    if (!user.gender) {
      return res.json({
        error:
          'there is an inconsistency while testing, please insert a user with a gender field',
      })
    }
    if (user.gender == 'male') {
      return res.json({
        error: 'males can not submit a maternity leave',
        statuscode: 21,
      })
    }
    const uploadId = req.body.uploadId
    const upload = await uploadsModel.findOne({
      _id: uploadId,
    })

    if (!upload) {
      return res.json({
        error:
          'either you did not upload document first, or the uploadId is invalid',
      })
    }
    const checkBelongs = await uploadsModel.findOne({
      _id: uploadId,
      requesterId: user.id,
    })
    if (!checkBelongs) {
      return res.json({
        error: 'although the upload is valid, but it does not belong to you',
      })
    }
    const dept = await departmentModel.findOne({ name: req.data.department })
    if (!dept) {
      return res.json({
        error:
          'there is data inconsistency while testing please insert a document in the department table with department name equal to department that the user belongs to',
      })
    }
    // console.log(dept)
    if (!dept.headOfDepartmentId) {
      return res.json({
        error:
          'there is data inconsistency while testing please insert a document in the department table with a valid headOfDepartmentId ',
      })
    }
    const startDate = new Date(req.body.startDate)
    await hodRequestsModel.create({
      day: startDate.getUTCDate(),
      month: startDate.getUTCMonth() + 1,
      year: startDate.getUTCFullYear(),
      typeOfRequest: 'maternityLeave',
      requesterId: req.data.id,
      headId: dept.headOfDepartmentId,
      reason: req.body.reason,
      documentId: uploadId,
    })
    return res.json({ message: 'success', statuscode: statusCodes.success })
  } catch (exception) {
    console.log(exception)
    return res.json({
      error: 'Something went wrong',
      statuscode: statusCodes.unknown,
    })
  }
}
const sendAccidentalLeave = async (req, res, next) => {
  try {
    const user = req.data
    const date = new Date(req.body.date)
    const userData = await staffModel.findOne({ id: user.id })
    if (new Date() < date) {
      return res.json({
        error: 'you can not take an accidental leave in a day in the future',
        statuscode: 22,
      })
    }

    if (userData.annualLeaveBalance < 1) {
      return res.json({
        error:
          'you can not take accidental leaves, beacuse you have depleted your balance',
        statuscode: annualLeaveDepleted,
      })
    }
    const dept = await departmentModel.findOne({ name: req.data.department })
    if (!dept) {
      return res.json({
        error:
          'there is data inconsistency while testing please insert a document in the department table with department name equal to department that the user belongs to',
      })
    }
    // console.log(dept)
    if (!dept.headOfDepartmentId) {
      return res.json({
        error:
          'there is data inconsistency while testing please insert a document in the department table with a valid headOfDepartmentId ',
      })
    }
    await hodRequestsModel.create({
      day: date.getUTCDate(),
      month: date.getUTCMonth() + 1,
      year: date.getUTCFullYear(),
      typeOfRequest: 'accidentalLeave',
      requesterId: req.data.id,
      headId: dept.headOfDepartmentId,
      reason: req.body.reason,
    })
    return res.json({ message: 'success', statuscode: statusCodes.success })
  } catch (exception) {
    console.log(exception)
    return res.json({
      error: 'Something went wrong',
      statuscode: statusCodes.unknown,
    })
  }
}
const changeDayOff = async (req, res, next) => {
  try {
    const user = req.data
    const newDay = req.body.newDay

    const dept = await departmentModel.findOne({ name: req.data.department })
    const schedule = await scheduleModel.find({
      staffId: user.id,
      day: newDay,
    })
    if (schedule.length != 0) {
      return res.json({
        error: 'you can not take a day off when you have teaching obligations',
        statuscode: youHaveTeachingObligationsForTheDay,
      })
    }
    if (!dept) {
      return res.json({
        error:
          'there is data inconsistency while testing please insert a document in the department table with department name equal to department that the user belongs to',
      })
    }
    // console.log(dept)
    if (!dept.headOfDepartmentId) {
      return res.json({
        error:
          'there is data inconsistency while testing please insert a document in the department table with a valid headOfDepartmentId ',
      })
    }
    const date = new Date()
    await hodRequestsModel.create({
      day: date.getUTCDate(),
      month: date.getUTCMonth() + 1,
      year: date.getUTCFullYear(),
      typeOfRequest: 'changeDayOff',
      requesterId: req.data.id,
      headId: dept.headOfDepartmentId,
      reason: req.body.reason,
      newDay,
    })
    return res.json({ message: 'success', statuscode: statusCodes.success })
  } catch (exception) {
    console.log(exception)
    return res.json({
      error: 'Something went wrong',
      statuscode: statusCodes.unknown,
    })
  }
}

const deleteSlotLinkingRequests = async (req, res, next) => {
  try {
    const howael3amalo = await requestSlotLinkingModel.findOne({
      staffId: req.data.id,
      _id: req.body.requestId,
    })
    //console.log(howael3amalo)
    //console.log(validid)

    if (howael3amalo) {
      const pendingtamam = await requestSlotLinkingModel.findOne({
        _id: req.body.requestId,
        status: 'pending',
      })
      if (pendingtamam) {
        await requestSlotLinkingModel.deleteOne({ _id: req.body.requestId })
        res.json({ statuscode: statusCodes.success, message: 'success' })
      } else {
        return res.json({
          error:
            'THIS REQUEST IS NOT PENDING ANYMORE , YOU CANT CANCEL IT NOW ',
          statuscode: notapendingrequestocancel,
        })
      }
    } else {
      return res.json({
        error: ' you didnt make this request to cancel it!!!!!!!',
        statuscode: notyourrequest,
      })
    }
  } catch (exception) {
    console.log(exception)
    return res.json({
      error: 'Something went wrong',
      statuscode: statusCodes.unknown,
    })
  }
}

const sendSlotLinkingRequests = async (req, res, next) => {
  try {
    var all = []
    const validid = await staffModel.findOne({ id: req.body.staffId })
    const validrequest = await scheduleModel.findOne({
      slotName: req.body.desiredSlotName,
      day: req.body.desiredSlotday,
      location: req.body.location,
      courseCode: req.body.courseCode,
      typeOfSlot: req.body.desiredSlotType,
      staffId: null,
    })

    if (!validid) {
      return res.json({
        error: 'StaffID is not found',
        statuscode: staffNotFound,
      })
    } else if (validid.id != req.data.id) {
      return res.json({
        error: 'enter your correct id',
        statuscode: staffNotFound,
      })
    } else {
      if (!validrequest) {
        return res.json({
          error: 'not a valid request',
        })
      }
      const dacourseande = req.body.courseCode
      var ande = 0
      for (i = 0; i < validid.courses.length; i++) {
        if (dacourseande == validid.courses[i]) {
          await requestSlotLinkingModel.create(req.body)
          ande = 1
          return res.json({
            statuscode: statusCodes.success,
            message: 'success',
          })
        }
      }

      if (ande == 0) {
        return res.json({
          error:
            'YOU CANT MAKE A SLOTLINKING REQUEST FOR A COURSE YOURE NOT ASSIGNED TO',
          statuscode: courseNotFound,
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
const viewSlotLinkingStatus = async (req, res, next) => {
  try {
    const temp = {}
    allresult = []
    accepted = []
    rejected = []
    pending = []

    const allhisrequests = await requestSlotLinkingModel.find({
      staffId: req.data.id,
    })
    if (allhisrequests) {
      allresult.push(allhisrequests)
    }
    const allaccept = await requestSlotLinkingModel.find({
      staffId: req.data.id,
      status: 'accepted',
    })
    if (allaccept) {
      //  console.log("lqlq")
      accepted.push(allaccept)
    }
    const allrej = await requestSlotLinkingModel.find({
      staffId: req.data.id,
      status: 'rejected',
    })
    if (allrej) {
      rejected.push(allrej)
    }
    const allpending = await requestSlotLinkingModel.find({
      staffId: req.data.id,
      status: 'pending',
    })
    if (allpending) {
      pending.push(allpending)
    }

    if (req.body.requestStatus == 'accepted') {
      if (accepted[0].length != 0)
        return res.json({
          ALLSlotLinkingRequestsForYou: accepted,
          statuscode: success,
        })
      else
        return res.json({
          statuscode: 200,
        })
    } else if (req.body.requestStatus == 'rejected') {
      if (rejected[0].length != 0)
        return res.json({
          ALLSlotLinkingRequestsForYou: rejected,
          statuscode: success,
        })
      else
        return res.json({
          statuscode: 200,
        })
    } else if (req.body.requestStatus == 'pending') {
      if (pending[0].length != 0)
        return res.json({
          ALLSlotLinkingRequestsForYou: pending,
          statuscode: success,
        })
      else
        return res.json({
          statuscode: 200,
        })
    } else {
      if (allresult[0].length != 0) {
        return res.json({
          ALLSlotLinkingRequestsForYou: allresult,
          statuscode: success,
        })
      } else
        return res.json({
          statuscode: 200,
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

const viewMyCourses = async (req, res, next) => {
  try {
    var temp = {}
    const output = []

    const staff_id = req.data.id
    const staff_role = req.data.role
    if (staff_role != 'AcademicMember') {
      return res.json({ error: 'You are not academic member ' })
    }
    const staffFound = await staffModel.findOne({ id: staff_id })
    const Courses = staffFound.courses
    if (Courses.length == 0) {
      return res.json({ error: 'You have no courses yet ' })
    } else {
      for (i = 0; i < Courses.length; i++) {
        //console.log(courses[i])
        var temp = {}
        temp.coursecode = Courses[i]

        output.push(temp)
      }

      return res.json({ mycourses: output, statuscode: success })
    }
  } catch (exception) {
    //console.log(exception)
    return res.json({
      error: 'Something went wrong',
      statuscode: statusCodes.unknown,
    })
  }
}

const viewCourseslots = async (req, res, next) => {
  try {
    var all = []
    var allnew = []
    const foundid = await staffModel.findOne({
      id: req.data.id,
    })

    for (i = 0; i < foundid.courses.length; i++) {
      console.log('de')
      const course = await scheduleModel.find({
        courseCode: foundid.courses[i],
        staffId: null,
      })
      all.push(course)
    }

    for (i = 0; i < all.length; i++) {
      for (j = 0; j < all[i].length; j++) {
        allnew.push(all[i][j])
      }
    }

    return res.json({
      output: allnew,
      statuscode: success,
    })
  } catch (exception) {
    console.log(exception)
    return res.json({
      error: 'Something went wrong',
      statuscode: statusCodes.unknown,
    })
  }
}

const viewRequestsStatus = async (req, res, next) => {
  try {
    const user = req.data
    const status = req.body.status
    if (status) {
      const allRequests = await hodRequestsModel.find(
        { requesterId: user.id, status },
        ['day', 'month', 'year', 'typeOfRequest']
      )
      const allNotification = []
      // await notificationModel.find({
      //   senderId: user.id,
      //   status,
      // })
      return res.json({
        requests: allRequests.concat(allNotification),
        message: 'success',
        statuscode: statusCodes.success,
      })
    }
    const allRequests = await hodRequestsModel.find({ requesterId: user.id }, [
      'status',
      'day',
      'month',
      'year',
      'typeOfRequest',
    ])
    const allNotification = []
    // await notificationModel.find({
    //   senderId: user.id,
    // })

    return res.json({
      requests: allRequests.concat(allNotification),
      message: 'success',
      statuscode: statusCodes.success,
    })
  } catch (exception) {
    console.log(exception)
    return res.json({
      error: 'Something went wrong',
      statuscode: statusCodes.unknown,
    })
  }
}
const cancelRequest = async (req, res, next) => {
  try {
    const requestId = req.body.requestId
    const user = req.data
    const requestFound = await hodRequestsModel.findOne({
      _id: requestId,
      requesterId: req.data.id,
    })
    if (!requestFound) {
      return res.json({
        error:
          'either id not valid, or the request does not belong to this user',
      })
    }
    if (requestFound.status == 'pending') {
      await hodRequestsModel.deleteOne({ _id: requestId })
      return res.json({ messgae: 'succes', statuscode: statusCodes.success })
    }
    const date = new Date(
      requestFound.year,
      requestFound.month - 1,
      requestFound.day
    )
    if (date >= new Date()) {
      if (!requestFound.typeOfRequest) {
        return res.json({
          error:
            'data inconsistency while testing please insert request with valid type of request',
        })
      }
      if (requestFound.typeOfRequest == 'compensationLeave') {
        await hodRequestsModel.deleteOne({ _id: requestId })
        await attendanceModel.deleteOne({
          status: 'compensationLeave',
          day: requestFound.day,
          month: requestFound.month,
          staffId: user.id,
        })
      }
      if (
        requestFound.typeOfRequest == 'annualLeave' ||
        requestFound.typeOfRequest == 'accidentalLeave'
      ) {
        console.log(user.id, requestFound.day, requestFound.month)

        await attendanceModel.deleteOne({
          status: requestFound.typeOfRequest,
          day: requestFound.day,
          month: requestFound.month,
          staffId: user.id,
        })

        await hodRequestsModel.deleteOne({ _id: requestId })
        const findUser = await staffModel.findOne({ id: user.id })

        const increaseBalance = findUser.annualLeaveBalance + 1
        console.log(increaseBalance)
        await staffModel.update(
          { id: user.id },
          { annualLeaveBalance: increaseBalance }
        )

        return res.json({ message: 'success', statuscode: statusCodes.success })
      }
      if (requestFound.typeOfRequest == 'changeDayOff') {
        return res.json({
          error:
            'you can not cancel an accepted or rejected changeDayOff request',
          statuscode: 27,
        })
      }
      if (requestFound.typeOfRequest == 'sickLeave') {
        await hodRequestsModel.deleteOne({ _id: requestId })
        await attendanceModel.deleteOne({
          status: 'sickLeave',
          day: requestFound.day,
          month: requestFound.month,
          staffId: user.id,
        })
        return res.json({ message: 'success', statuscode: statusCodes.success })
      }
      if (requestFound.typeOfRequest == 'maternityLeave') {
        await hodRequestsModel.deleteOne({ _id: requestId })
        await attendanceModel.deleteMany({
          status: 'maternityLeave',
          month: { $gte: requestFound.month },
          staffId: user.id,
        })
        let monthToDelete = requestFound.month + 1
        monthToDelete = monthToDelete % 12
        await attendanceModel.deleteMany({
          status: 'maternityLeave',
          month: { $gte: monthToDelete },
          staffId: user.id,
        })
        monthToDelete = requestFound.month + 1
        monthToDelete = monthToDelete % 12
        await attendanceModel.deleteMany({
          status: 'maternityLeave',
          month: { $gte: monthToDelete },
          staffId: user.id,
        })
        return res.json({ message: 'success', statuscode: statusCodes.success })
      }
    } else {
      return res.json({
        error: 'you cannot delete this request because its day has passed',
        statuscode: 28,
      })
    }
  } catch (exception) {
    console.log(exception)
    return res.json({
      error: 'Something went wrong',
      statuscode: statusCodes.unknown,
    })
  }
}
const notifyAcceptRejectRequest = async (req, res, next) => {
  try {
    const acId = req.data.id
    const temp = []
    const reqOfAc = await hodRequestsModel.find({ requesterId: acId })
    for (i = 0; i < reqOfAc.length; i++) {
      if (reqOfAc[i].viewBySender == false) {
        temp.push(reqOfAc[i])
      }
    }

    return res.json({
      requests: temp,
      message: 'success',
      statuscode: statusCodes.success,
    })
  } catch (exception) {
    return res.json({
      error: 'Something went wrong',
      statuscode: statusCodes.unknown,
    })
  }
}
const removeNotification = async (req, res, next) => {
  try {
    const acId = req.data.id
    const temp = []
    console.log('in remove notification')
    const reqOfAc = await hodRequestsModel.find({ requesterId: acId })

    for (i = 0; i < reqOfAc.length; i++) {
      if (reqOfAc[i].viewBySender == false) {
        temp.push(reqOfAc[i])
        console.log(reqOfAc[i].requesterId, '-----')

        await hodRequestsModel.update(
          { _id: reqOfAc[i]._id },
          { viewBySender: true }
        )
      }
    }

    return res.json({
      requests: temp,
      message: 'success',
      statuscode: statusCodes.success,
    })
  } catch (exception) {
    return res.json({
      error: 'Something went wrong',
      statuscode: statusCodes.unknown,
    })
  }
}

const ViewAllMyUploads = async (req, res) => {
  try {
    const user = req.data
    const allUploads = await uploadsModel.find({ requesterId: user.id })
    return res.json({
      statuscode: statusCodes.success,
      message: 'success',
      uploads: allUploads,
    })
  } catch (exception) {
    return res.json({
      error: 'Something went wrong',
      statuscode: statusCodes.unknown,
    })
  }
}
module.exports = {
  sendReplacementNotification,
  sendAnnualLeaveRequest,
  acceptReplacementRequest,
  rejectReplacementRequest,
  viewReplacementRequests,
  sendCompensationLeave,
  sendSickLeave,
  uploadDocument,
  sendMaternityLeave,
  sendAccidentalLeave,
  changeDayOff,
  sendSlotLinkingRequests,
  viewSchedule,
  viewMyCourses,
  deleteSlotLinkingRequests,
  viewSlotLinkingStatus,
  viewRequestsStatus,
  cancelRequest,
  notifyAcceptRejectRequest,
  ViewAllMyUploads,
  viewCourseslots,
  removeNotification,
}
