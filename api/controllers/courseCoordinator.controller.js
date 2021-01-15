const facultyModel = require('../../models/faculty')

const { departmentModel } = require('../../models/department')
const locationModel = require('../../models/location')
const scheduleModel = require('../../models/schedule')
const statusCodes = require('../constants/statusCodes')
const {
  Noslotlinkingrequests,
  youHaveAlreadyAcceptedOrRejectedThisRequest,
  notyourrequest,
  requestnotfound,
} = require('../errorCodes')
const Joi = require('joi')
const staffModel = require('../../models/staff')
const requestSlotLinkingModel = require('../../models/requestSlotLinking')

const { coursesModel } = require('../../models/courses')

const errorCodes = require('../errorCodes')
const { success } = require('../constants/statusCodes')

const rejectSlotLinkingRequests = async (req, res, next) => {
  try {
    const agebrequest = await requestSlotLinkingModel.findOne({
      _id: req.body.requestId,
    })

    const block = await staffModel.findOne({ id: req.data.id })
    found = 0
    if (block) {
      if (agebrequest) {
        const coursecode = agebrequest.courseCode
        for (i = 0; i < block.courses.length; i++) {
          if (coursecode == block.courses[i]) {
            found = 1
          }
        }
      } else {
        return res.json({
          error: 'request with this ID not found !',
          statuscode: requestnotfound,
        })
      }
    }

    if (found == 1) {
      if (agebrequest) {
        const statuss = agebrequest.status
        if (statuss == 'accepted' || statuss == 'rejected') {
          return res.json({
            error: 'you have already accepted or rejected this request before',
            statuscode: youHaveAlreadyAcceptedOrRejectedThisRequest,
          })
        } else {
          await requestSlotLinkingModel.findOneAndUpdate(
            { _id: req.body.requestId },
            { status: 'rejected' },
            { useFindAndModify: false }
          )
          
        }
      } else {
        return res.json({
          error: 'request with this ID not found !',
          statuscode: requestnotfound,
        })
      }
    } else {
      return res.json({
        error: 'its not your course to cancel its request !',
        statuscode: notyourrequest,
      })
    }

    res.json({ statuscode: statusCodes.success, message: 'success' })
  } catch (exception) {
    console.log(exception)
    return res.json({
      error: 'Something went wrong',
      statuscode: statusCodes.unknown,
    })
  }
}

const acceptSlotLinkingRequests = async (req, res, next) => {
  try {
    const validrequest = await requestSlotLinkingModel.findOne({
      _id: req.body.requestId,
    })
    const yourcourse = await staffModel.findOne({ id: req.data.id })
    yc = 0

    // ,day:validrequest.desiredSlotday,location:validrequest.location,courseCode:validrequest.coursecode,typeOfSlot:validrequest.desiredSlotType})

    if (validrequest) {
      const valid = await scheduleModel.findOne({
        slotName: validrequest.desiredSlotName,
        day: validrequest.desiredSlotday,
        location: validrequest.location,
        courseCode: validrequest.courseCode,
        typeOfSlot: validrequest.desiredSlotType,
      })
      const validd = await scheduleModel.findOne({
        slotName: validrequest.desiredSlotName,
        day: validrequest.desiredSlotday,
        location: validrequest.location,
      })
      // console.log( validd )
      for (i = 0; i < yourcourse.courses.length; i++) {
        if (validrequest.courseCode == yourcourse.courses[i]) {
          yc = 1
        }
      }

      if (yc == 1) {
        if (validrequest.status == 'pending') {
          if (valid && valid.staffId == null) {
            //const ayhaga = await scheduleModel.findOne({slotName:validrequest.desiredSlotName,day:validrequest.desiredSlotday,location:validrequest.location,courseCode:validrequest.courseCode,typeOfSlot:validrequest.desiredSlotType}  )

            await scheduleModel.findOneAndUpdate(
              {
                slotName: validrequest.desiredSlotName,
                day: validrequest.desiredSlotday,
                location: validrequest.location,
                courseCode: validrequest.courseCode,
                typeOfSlot: validrequest.desiredSlotType,
              },
              { $set: { staffId: validrequest.staffId } },
              { useFindAndModify: false }
            )

            await requestSlotLinkingModel.findOneAndUpdate(
              { _id: req.body.requestId },
              { status: 'accepted' },
              { useFindAndModify: false }
            )

            const updatecourseassigned = validrequest.courseCode
            var as = await coursesModel.findOne({ code: updatecourseassigned })
            var assigned = as.signedSlot
            if (assigned == null) {
              assigned = 1
            } else {
              assigned += 1
            }
            await coursesModel.findOneAndUpdate(
              { code: updatecourseassigned },
              { signedSlot: assigned }
            )
            res.json({ statuscode: statusCodes.success, message: 'success' })
          } else {
            return res.json({
              error:
                ' this slot already has an assigned Staff member OR this slot doesnt exist for your course to accept it! , you should reject this request',
              statuscode: requestnotfound,
            })
          }
        } else {
          return res.json({
            error:
              ' youve accepted or rejected this slotlinking request before',
            statuscode: youHaveAlreadyAcceptedOrRejectedThisRequest,
          })
        }
      } else {
        return res.json({
          error: ' its not your course to accept it ',
          statuscode: notyourrequest,
        })
      }
    } else {
      return res.json({
        error: ' No request with this ID is found ',
        statuscode: requestnotfound,
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

const viewSlotLinkingRequests = async (req, res, next) => {
  try {
    const idcoursecoordinator = await staffModel.findOne({ id: req.data.id })
    const temp = {}
    result = []
    finalresult=[]
    if (idcoursecoordinator) {
      for (i = 0; i < idcoursecoordinator.courses.length; i++) {
        const slotLinkingRequests = await requestSlotLinkingModel.findOne({
          courseCode: idcoursecoordinator.courses[i],
        })

        if (slotLinkingRequests) {
          const allslotLinkingRequests = await requestSlotLinkingModel.find({
            courseCode: idcoursecoordinator.courses[i],
          })
          

   
           


              result.push(allslotLinkingRequests)
             // console.log(result.length)

        

         
        }
      }

      if (result.length == 0) {
        return res.json({
          error: 'NO slot linking request for your courses ',
          statuscode: Noslotlinkingrequests,
        })
      } else {
        for(i=0;i<result.length;i++){

          for(j=0;j<result[i].length;j++){
          
            finalresult.push(result[i][j])
          }
          
                                 }
        return res.json({ YourSlotLinkingRequests: finalresult ,   statuscode:success})
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

const addCourseSlot = async (req, res, next) => {
  try {
    const courseCoordinatorId = req.data.id
    //const courseCoordinatorId = req.body.courseCoordinatorId
    //3ayza a check en course code mawgoud f course table
    const courseFound = await coursesModel.findOne({
      code: req.body.courseCode,
    })
    if (!courseFound) {
      return res.json({
        error: 'Course does not exist',
        statuscode: errorCodes.courseDoesNotExist,
      })
    }

    //3ayza a check en el location mawgood f table location
    const locationFound = await locationModel.findOne({
      location: req.body.location,
    })
    if (!locationFound) {
      return res.json({
        error: 'Location does not exist',
        statuscode: errorCodes.locationDoesntExist,
      })
    }

    const slotExist = await scheduleModel.findOne({
      slotName: req.body.slotName,
      day: req.body.day,
      typeOfSlot: req.body.typeOfSlot,
      location: req.body.location,
      courseCode: req.body.courseCode,
    })
    if (slotExist) {
      return res.json({
        error: 'slot already exist',
        statuscode: errorCodes.slotAlreadyExist,
      })
    }

    const slotTaken = await scheduleModel.findOne({
      slotName: req.body.slotName,
      day: req.body.day,
      location: req.body.location,
    })
    if (slotTaken) {
      return res.json({
        error: 'slot already taken',
        statuscode: errorCodes.slotAlreadyTaken,
      })
    }

    // a check en el course coordinator da beyedy code beta3 courseCode
    const courseCoord = await staffModel.findOne({ id: courseCoordinatorId })
    const coursesOfcourseCoord = courseCoord.courses
    const courseExist = coursesOfcourseCoord.indexOf(req.body.courseCode)
    if (courseExist < 0) {
      return res.json({
        error: 'Course coordinator does not teach this course',
        statuscode: errorCodes.courseCoordDoesnotTeachThisCourse,
      })
    }
    const slot = req.body.slotName
    var timing = ''
    if (slot == 1) {
      timing = 'from 8:15 till 9:45'
    } else if (slot == 2) {
      timing = 'from 10:00 till 11:30'
    } else if (slot == 3) {
      timing = 'from 11:45 till 1:15'
    } else if (slot == 4) {
      timing = 'from 1:45 till 3:15'
    } else if (slot == 5) {
      timing = 'from 3:45 till 5:15'
    }
    await scheduleModel.create(req.body)
    await scheduleModel.findOneAndUpdate(
      {
        slotName: req.body.slotName,
        day: req.body.day,
        typeOfSlot: req.body.typeOfSlot,
        location: req.body.location,
        courseCode: req.body.courseCode,
      },
      { timing: timing },
      { useFindAndModify: false }
    )
    //ba-add 1 in totalSlots f course table
    const courses = await coursesModel.findOne({ code: req.body.courseCode })
    const slotsInCourses = courses.totalSlots
    if (!slotsInCourses) {
      await coursesModel.findOneAndUpdate(
        { code: req.body.courseCode },
        { totalSlots: 0 },
        { useFindAndModify: false }
      )
    }
    const courses1 = await coursesModel.findOne({ code: req.body.courseCode })
    const slotsInCourses1 = courses1.totalSlots
    await coursesModel.findOneAndUpdate(
      { code: req.body.courseCode },
      { totalSlots: slotsInCourses1 + 1 },
      { useFindAndModify: false }
    )
    res.json({ statuscode: statusCodes.success, message: 'success' })
  } catch (exception) {
    //console.log(exception)
    return res.json({
      error: 'Something went wrong',
      statuscode: statusCodes.unknown,
    })
  }
}
const deleteCourseSlot = async (req, res, next) => {
  try {
    const courseCoordinatorId = req.data.id
    //const courseCoordinatorId = req.body.courseCoordinatorId

    const courseFound = await coursesModel.findOne({
      code: req.body.courseCode,
    })
    if (!courseFound) {
      return res.json({
        error: 'Course does not exist',
        statuscode: errorCodes.courseDoesNotExist,
      })
    }
    // a check en el course coordinator da beyedy code beta3 courseCode
    const courseCoord = await staffModel.findOne({ id: courseCoordinatorId })
    const coursesOfcourseCoord = courseCoord.courses
    const courseExist = coursesOfcourseCoord.indexOf(req.body.courseCode)
    if (courseExist < 0) {
      return res.json({
        error: 'Course coordinator does not teach this course',
        statuscode: errorCodes.courseCoordDoesnotTeachThisCourse,
      })
    }

    const exist = await scheduleModel.findOne({
      slotName: req.body.slotName,
      day: req.body.day,
      location: req.body.location,
      // courseCode:req.body.courseCode
    })
    if (!exist) {
      return res.json({
        error: 'course slot does not exist',
        statuscode: errorCodes.courseSlotDoesNotExist,
      })
    }
    await scheduleModel.findOneAndDelete({
      slotName: req.body.slotName,
      day: req.body.day,
      location: req.body.location,
      //courseCode:req.body.courseCode
    })

    //ba-minus 1 in totalSlots f course table
    const totSlots = courseFound.totalSlots
    if (courseFound.totalSlots == null) {
      return res.json({
        error: 'No total slots in this course',
        statuscode: errorCodes.noTotalSlotsInThisCourse,
      })
    }
    await coursesModel.findOneAndUpdate(
      { code: req.body.courseCode },
      { totalSlots: totSlots - 1 },
      { useFindAndModify: false }
    )
    res.json({ statuscode: statusCodes.success, message: 'success' })
  } catch (exception) {
    return res.json({
      error: 'Something went wrong',
      statuscode: statusCodes.unknown,
    })
  }
}

const updateCourseSlot = async (req, res, next) => {
  try {
    const courseCoordinatorId = req.data.id

    // a check en el course coordinator da beyedy code beta3 courseCode
    const courseCoord = await staffModel.findOne({ id: courseCoordinatorId })
    const coursesOfcourseCoord = courseCoord.courses
    const courseExist = coursesOfcourseCoord.indexOf(req.body.courseCode)
    if (courseExist < 0) {
      return res.json({
        error: 'course Coordinator does not teach this course',
        statuscode: errorCodes.courseCoordDoesnotTeachThisCourse,
      })
    }

    const exist = await scheduleModel.findOne({
      slotName: req.body.slotName,
      day: req.body.day,
      location: req.body.location,
      courseCode: req.body.courseCode,
    })
    if (!exist) {
      return res.json({
        error: 'course slot does not exist',
        statuscode: errorCodes.courseSlotDoesNotExist,
      })
    }

    const toBeUpdated = await scheduleModel.findOne({
      slotName: req.body.slotName,
      day: req.body.day,
      location: req.body.location,
    })
    const objId = toBeUpdated._id
    if (req.body.updatedDay) {
      await scheduleModel.findByIdAndUpdate(
        { _id: objId },
        { day: req.body.updatedDay },
        { useFindAndModify: false }
      )
    }
    if (req.body.updatedSlotName) {
      const slot = req.body.updatedSlotName
      var timing = ''
      if (slot == 1) {
        timing = 'from 8:15 till 9:45'
      } else if (slot == 2) {
        timing = 'from 10:00 till 11:30'
      } else if (slot == 3) {
        timing = 'from 11:45 till 1:15'
      } else if (slot == 4) {
        timing = 'from 1:45 till 3:15'
      } else if (slot == 5) {
        timing = 'from 3:45 till 5:15'
      }
      await scheduleModel.findByIdAndUpdate(
        { _id: objId },
        { slotName: req.body.updatedSlotName, timing: timing },
        { useFindAndModify: false }
      )
    }
    if (req.body.updatedLocation) {
      const locationExist = await locationModel.findOne({
        location: req.body.updatedLocation,
      })
      if (!locationExist) {
        return res.json({
          error: 'location does not exist',
          statuscode: errorCodes.locationNotFound,
        })
      }
      await scheduleModel.findByIdAndUpdate(
        { _id: objId },
        { location: req.body.updatedLocation },
        { useFindAndModify: false }
      )
    }
    if (req.body.updatedCourseCode) {
      const upcourseFound = await coursesModel.findOne({
        code: req.body.updatedCourseCode,
      })
      if (!upcourseFound) {
        return res.json({
          error: 'Course does not exist',
          statuscode: errorCodes.courseDoesNotExist,
        })
      }

      const courseCoordi = await staffModel.findOne({ id: courseCoordinatorId })
      const coursesOfcourseCoord = courseCoordi.courses
      const courseExist1 = coursesOfcourseCoord.indexOf(
        req.body.updatedCourseCode
      )
      if (courseExist1 < 0) {
        return res.json({
          error: 'course Coordinator does not teach this course',
          statuscode: errorCodes.courseCoordDoesnotTeachThisCourse,
        })
      }
      await scheduleModel.findByIdAndUpdate(
        { _id: objId },
        { courseCode: req.body.updatedCourseCode },
        { useFindAndModify: false }
      )
    }
    if (req.body.updatedTypeOfSlot) {
      await scheduleModel.findByIdAndUpdate(
        { _id: objId },
        { typeOfSlot: req.body.updatedTypeOfSlot },
        { useFindAndModify: false }
      )
    }
    res.json({ statuscode: statusCodes.success, message: 'success' })
  } catch (exception) {
    return res.json({
      error: 'Something went wrong',
      statuscode: statusCodes.unknown,
    })
  }
}
module.exports = {
  addCourseSlot,
  deleteCourseSlot,
  updateCourseSlot,
  viewSlotLinkingRequests,
  rejectSlotLinkingRequests,
  acceptSlotLinkingRequests,
}
