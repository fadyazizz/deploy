const attendanceModel = require('../../models/attendance')
const hodRequestsModel = require('../../models/hodRequests')
const staffModel = require('../../models/staff')
const statusCodes = require('../constants/statusCodes')
const {
  youHaveAlreadyAcceptedOrRejectedThisRequest,
  NoCoursesforyou,
  YourCoursesarenotassigned,
  unvaliddepartment,
} = require('../errorCodes')

const facultyModel = require('../../models/faculty')

const { departmentModel } = require('../../models/department')
const locationModel = require('../../models/location')
const scheduleModel = require('../../models/schedule')

const requestSlotLinkingModel = require('../../models/requestSlotLinking')
const { coursesModel } = require('../../models/courses')

const errorCodes = require('../errorCodes')
const replacementsModel = require('../../models/replacements')
const { success } = require('../constants/statusCodes')

const viewAllRequests = async (req, res, next) => {
  try {
    const requests = await hodRequestsModel.find({ headId: req.data.id })
    return res.json({ AllRequests: requests, statuscode: statusCodes.success })
  } catch (exception) {
    console.log(exception)
    return res.json({
      error: 'Something went wrong',
      statuscode: statusCodes.unknown,
    })
  }
}

const rejectRequest = async (req, res, next) => {
  try {
    const requestId = req.body.requestId
    const requestFound = await hodRequestsModel.findOne({ _id: requestId })
    const comment = req.body.comment
    if (!requestFound) {
      return res.json({
        error: 'invalid requestId, put a correct id in requestId',
      })
    }
    if (
      requestFound.status == 'accepted' ||
      requestFound.status == 'rejected'
    ) {
      return res.json({
        error: 'you have already accepted or rejected this request',
        statuscode: youHaveAlreadyAcceptedOrRejectedThisRequest,
      })
    }

    const requestBelongs = await hodRequestsModel.findOne({
      _id: requestId,
      headId: req.data.id,
    })

    if (!requestBelongs) {
      return res.json({
        error:
          'although requestId is valid, this request belongs to another head',
      })
    }
    await hodRequestsModel.update(
      { _id: requestId },
      { status: 'rejected', viewedBySender: false, comment: comment }
    )
    return res.json({ statuscode: statusCodes.success, message: 'success' })
  } catch (exception) {
    console.log(exception)
    return res.json({
      error: 'Something went wrong',
      statuscode: statusCodes.unknown,
    })
  }
}

const acceptRequest = async (req, res, next) => {
  try {
    const requestId = req.body.requestId
    const requestFound = await hodRequestsModel.findOne({ _id: requestId })
    if (!requestFound) {
      return res.json({
        error: 'invalid requestId, put a correct id in requestId',
      })
    }
    if (
      requestFound.status == 'accepted' ||
      requestFound.status == 'rejected'
    ) {
      return res.json({
        error: 'you have already accepted or rejected this request',
        statuscode: youHaveAlreadyAcceptedOrRejectedThisRequest,
      })
    }

    const requestBelongs = await hodRequestsModel.findOne({
      _id: requestId,
      headId: req.data.id,
    })

    if (!requestBelongs) {
      return res.json({
        error:
          'although requestId is valid, this request belongs to another head',
      })
    }
    const requestType = requestFound.typeOfRequest
    if (requestType == 'changeDayOff') {
      const requesterId = requestFound.requesterId

      if (!requesterId) {
        return res.json({
          error:
            'date inconsistency while testing, please test on a request with valid requester id, by making sure that the request has requesterId',
        })
      }
      const member = await staffModel.findOne({ id: requesterId })
      if (!member) {
        return res.json({
          error:
            'date inconsistency while testing, please test on a request with a requesterId that actually belongs to a staff member, to be able to see the effect of changed day off',
        })
      }
      if (!requestFound.newDay) {
        return res.json({
          error:
            'date inconsistency while testing, please test on a changeDayOff request having newDay field correclty set',
        })
      }
      await hodRequestsModel.update(
        { _id: requestId },
        { status: 'accepted', viewBySender: false }
      )
      await staffModel.update(
        { id: requesterId },
        { dayoff: requestFound.newDay }
      )
      return res.json({ statuscode: statusCodes.success, message: 'success' })
    }
    if (requestType == 'compensationLeave') {
      const requesterId = requestFound.requesterId

      if (!requesterId) {
        return res.json({
          error:
            'date inconsistency while testing, please test on a request with valid requester id, by making sure that the request has requesterId',
        })
      }
      const member = await staffModel.findOne({ id: requesterId })
      if (!member) {
        return res.json({
          error:
            'date inconsistency while testing, please test on a request with a requesterId that actually belongs to a staff member, to be able to see the effect of compensation leave on attendance',
        })
      }
      const month = requestFound.month
      const day = requestFound.day
      if (!month) {
        return res.json({
          error:
            'date inconsistency while testing, please test on a request with a month field, so that when this user logs in on his day of this compensation leave will be added with correct date',
        })
      }
      if (!day) {
        return res.json({
          error:
            'date inconsistency while testing, please test on a request with a day field, so that when this user logs in on his day of, this compensation leave will be added with correct date',
        })
      }
      await hodRequestsModel.update(
        { _id: requestId },
        { status: 'accepted', viewBySender: false, used: false }
      )

      return res.json({ statuscode: statusCodes.success, message: 'success' })
    }
    if (requestType == 'annualLeave') {
      const requesterId = requestFound.requesterId

      if (!requesterId) {
        return res.json({
          error:
            'date inconsistency while testing, please test on a request with valid requester id, by making sure that the request has requesterId',
        })
      }
      const member = await staffModel.findOne({ id: requesterId })
      if (!member) {
        return res.json({
          error:
            'date inconsistency while testing, please test on a request with a requesterId that actually belongs to a staff member, to be able to see the effect of annual leave on attendance',
        })
      }
      const month = requestFound.month
      const day = requestFound.day
      if (!month) {
        return res.json({
          error:
            'date inconsistency while testing, please test on a request with a month field, so that the annual leave is inserted correctly in attendance',
        })
      }
      if (!day) {
        return res.json({
          error:
            'date inconsistency while testing, please test on a request with a day field, so that the annual leave is inserted correctly in attendance',
        })
      }
      await hodRequestsModel.update(
        { _id: requestId },
        { status: 'accepted', viewBySender: false }
      )
      await attendanceModel.create({
        day: day,
        month: month,
        status: 'annualLeave',
        totalMinutes: 24,
        totalHours: 8,
        staffId: requesterId,
      })
      const newAnnualLeave = member.annualLeaveBalance - 1

      const updated = await staffModel.update(
        { id: requesterId },
        { annualLeaveBalance: newAnnualLeave }
      )
      const replacers = requestFound.replacements
      replacers.forEach(async (replacer) => {
        if (replacer.status == 'accepted') {
          await replacementsModel.create({
            replacerId: replacer.replacerId,
            day: replacer.day,
            month: replacer.month,
            year: replacer.year,
            slot: replacer.slot,
            course: replacer.course,
            location: replacer.location,
            typeOfSlot: replacer.typeOfRequest,
          })
        }
      })
      return res.json({ statuscode: statusCodes.success, message: 'success' })
    }
    if (requestType == 'sickLeave') {
      const requesterId = requestFound.requesterId

      if (!requesterId) {
        return res.json({
          error:
            'date inconsistency while testing, please test on a request with valid requester id, by making sure that the request has requesterId',
        })
      }
      const member = await staffModel.findOne({ id: requesterId })
      if (!member) {
        return res.json({
          error:
            'date inconsistency while testing, please test on a request with a requesterId that actually belongs to a staff member, to be able to see the effect of sick leave on attendance',
        })
      }
      const month = requestFound.month
      const day = requestFound.day
      if (!month) {
        return res.json({
          error:
            'date inconsistency while testing, please test on a request with a month field,so that the sick leave is inserted correctly in attendance',
        })
      }
      if (!day) {
        return res.json({
          error:
            'date inconsistency while testing, please test on a request with a day field, so that the sick leave is inserted correctly in attendance',
        })
      }
      await hodRequestsModel.update(
        { _id: requestId },
        { status: 'accepted', viewBySender: false }
      )
      await attendanceModel.create({
        day: day,
        month: month,
        status: 'sickLeave',
        totalMinutes: 24,
        totalHours: 8,
        staffId: requesterId,
      })
      return res.json({ statuscode: statusCodes.success, message: 'success' })
    }
    if (requestType == 'maternityLeave') {
      const requesterId = requestFound.requesterId

      if (!requesterId) {
        return res.json({
          error:
            'date inconsistency while testing, please test on a request with valid requester id, by making sure that the request has requesterId',
        })
      }
      const member = await staffModel.findOne({ id: requesterId })
      if (!member) {
        return res.json({
          error:
            'date inconsistency while testing, please test on a request with a requesterId that actually belongs to a staff member, to be able to see the effect of maternity leave on attendance',
        })
      }
      const month = requestFound.month
      const day = requestFound.day
      if (!month) {
        return res.json({
          error:
            'date inconsistency while testing, please test on a request with a month field, so that the maternity leave is inserted correctly in attendance',
        })
      }
      if (!day) {
        return res.json({
          error:
            'date inconsistency while testing, please test on a request with a day field, so that the maternity leave is inserted correctly in attendance',
        })
      }
      await hodRequestsModel.update(
        { _id: requestId },
        { status: 'accepted', viewBySender: false }
      )
      const dateoFStart = new Date()
      dateoFStart.setUTCDate(requestFound.day)
      dateoFStart.setUTCMonth(requestFound.month - 1)
      dateoFStart.setUTCFullYear(requestFound.year)
      const dateOfMaternityLeaveEnd = new Date()
      dateOfMaternityLeaveEnd.setUTCFullYear(dateoFStart.getUTCFullYear())
      dateOfMaternityLeaveEnd.setUTCMonth(dateoFStart.getUTCMonth() + 3)
      dateOfMaternityLeaveEnd.setUTCDate(dateoFStart.getUTCDate())
      const dateDiff =
        (dateOfMaternityLeaveEnd.getTime() - dateoFStart.getTime()) /
        (1000 * 60 * 60 * 24)

      const attendanceToBeAdded = []
      for (
        var i = dateoFStart.getUTCDate() + 1;
        i < dateDiff + dateoFStart.getUTCDate() + 1;
        i++
      ) {
        const Date1 = new Date(
          dateoFStart.getUTCFullYear(),
          dateoFStart.getUTCMonth(),
          i
        )
        //console.log('here')
        attendanceToBeAdded.push({
          day: Date1.getUTCDate(),
          month: Date1.getUTCMonth() + 1,
          status: 'maternityLeave',
          totalMinutes: 24,
          totalHours: 8,
          staffId: requesterId,
        })
      }
      //console.log(attendanceToBeAdded)

      await attendanceModel.create(attendanceToBeAdded)
      return res.json({ statuscode: statusCodes.success, message: 'success' })
    }
    if (requestType == 'accidentalLeave') {
      const requesterId = requestFound.requesterId

      if (!requesterId) {
        return res.json({
          error:
            'date inconsistency while testing, please test on a request with valid requester id, by making sure that the request has requesterId',
        })
      }
      const member = await staffModel.findOne({ id: requesterId })
      if (!member) {
        return res.json({
          error:
            'date inconsistency while testing, please test on a request with a requesterId that actually belongs to a staff member, to be able to see the effect of accidental leave on attendance',
        })
      }
      const month = requestFound.month
      const day = requestFound.day
      if (!month) {
        return res.json({
          error:
            'date inconsistency while testing, please test on a request with a month field, so that the accidental leave is inserted correctly in attendance',
        })
      }
      if (!day) {
        return res.json({
          error:
            'date inconsistency while testing, please test on a request with a day field, so that the accidental leave is inserted correctly in attendance',
        })
      }
      await hodRequestsModel.update(
        { _id: requestId },
        { status: 'accepted', viewBySender: false }
      )
      await attendanceModel.create({
        day: day,
        month: month,
        status: 'accidentalLeave',
        totalMinutes: 24,
        totalHours: 8,
        staffId: requesterId,
      })
      // console.log('member annual leave balance', member.annualLeaveBalance)
      const newAnnualLeave = member.annualLeaveBalance - 1

      const updated = await staffModel.update(
        { id: requesterId },
        { annualLeaveBalance: newAnnualLeave }
      )
      // console.log(updated)
      return res.json({ statuscode: statusCodes.success, message: 'success' })
    }
  } catch (exception) {
    console.log(exception)
    return res.json({
      error: 'Something went wrong',
      statuscode: statusCodes.unknown,
    })
  }
}

const viewCoursesCoverage = async (req, res, next) => {
  //hod view courses coverage in his dep
  try {
    var result = []
    var displaycourse = []
    const idHOD = await departmentModel.findOne({
      headOfDepartmentId: req.data.id,
    })
    if (idHOD) {
      const cfeldep = idHOD.courses

      if (!(cfeldep.length == 0)) {
        for (i = 0; i < cfeldep.length; i++) {
          // console.log(findhodstaffmodel.courses)
          const getAyhaga = await coursesModel.findOne({
            code: cfeldep[i],
          })
          displaycourse.push(getAyhaga)

          if (!(displaycourse == [])) {
            const checknotnull = await coursesModel.findOne({
              code: cfeldep[i],
            })

            const courseC =
              displaycourse[i].signedSlot / displaycourse[i].totalSlots
            await coursesModel.update(
              { code: cfeldep[i] },
              { courseCoverage: courseC }
            )

            var temp = {}

            const cc = await coursesModel.findOne({ courseCoverage: courseC })
            temp.coursecode = displaycourse[i].code
            temp.CourseCoverage = cc.courseCoverage

            result.push(temp)
          }
        }
      }
      if (cfeldep.length == 0) {
        return res.json({
          error: 'Did not find courses for you',
          statuscode: NoCoursesforyou,
        })
      } else {
        return res.json({
          statuscode: success,
          CourseCoverageOfMyCourses: result,
        })
      }
    } else {
      return res.json({
        error: 'Did not find your department',
        statuscode: unvaliddepartment,
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
const viewTeachingAssHOD = async (req, res, next) => {
  try {
    var result = []
    var finalresult = []
    //staffId: String,
    //courseCode: String,
    const staffblock = await departmentModel.findOne({
      headOfDepartmentId: req.data.id,
    })
    if (staffblock) {
      for (i = 0; i < staffblock.courses.length; i++) {
        const coursefound = await scheduleModel.find({
          courseCode: staffblock.courses[i],
        })
        if (coursefound) {
          result.push(coursefound)
        }
      }

      for (i = 0; i < result.length; i++) {
        for (j = 0; j < result[i].length; j++) {
          if (result[i][j].staffId == null) {
          } else {
            finalresult.push(result[i][j])
          }
        }
      }

      if (finalresult.length == 0) {
        return res.json({
          error: 'you dont have courses or your courses are not assigned',
          statuscode: YourCoursesarenotassigned,
        })
      } else {
        res.json({ MyTeachingAssignments: finalresult, statuscode: success })
      }
    } else {
      return res.json({
        error: 'we did not find your department',
        statuscode: unvaliddepartment,
      })
    }

    // res.json({ statuscode: statusCodes.success, message: 'success' })
  } catch (exception) {
    console.log(exception)
    return res.json({
      error: 'Something went wrong',
      statuscode: statusCodes.unknown,
    })
  }
}
const viewAllStaff = async (req, res, next) => {
  try {
    const HOD_ID = req.data.id

    const departmentFound = await departmentModel.findOne({
      headOfDepartmentId: HOD_ID,
    })

    const staff = departmentFound.staff

    var OUTPUT = []
    for (i = 0; i < staff.length; i++) {
      var staff_id = staff[i]
      const staffFound = await staffModel.findOne({ id: staff_id })

      var temp = {}
      temp.id = staff_id
      temp.gender = staffFound.gender
      temp.name = staffFound.name
      temp.salary = staffFound.salary
      temp.email = staffFound.email
      temp.role = staffFound.roleOfAcademicMember
      temp.dayoff = staffFound.dayoff

      temp.location = staffFound.locationName

      OUTPUT.push(temp)
    }
    res.json({ allstaffindep: OUTPUT, statuscode: success })
  } catch (exception) {
    //console.log(exception)
    return res.json({
      error: 'Something went wrong',
      statuscode: statusCodes.unknown,
    })
  }
}

const viewAllStaffPerCourse = async (req, res, next) => {
  try {
    const HOD_ID = req.data.id
    const departmentFound = await departmentModel.findOne({
      headOfDepartmentId: HOD_ID,
    })
    const courses = departmentFound.courses
    const staff = departmentFound.staff

    const Course = req.body.courseId
    var OUTPUT = []
    if (!Course) {
      for (i = 0; i < courses.length; i++) {
        for (j = 0; j < staff.length; j++) {
          var staff_id = staff[j]

          const staffFound = await staffModel.findOne({ id: staff_id })
          console.log(staffFound)

          for (x = 0; x < staffFound.courses.length; x++)
            if (staffFound.courses[x] == courses[i]) {
              var temp = {}
              temp.course = courses[i]
              temp.id = staff_id
              temp.name = staffFound.name
              temp.salary = staffFound.salary
              temp.gender = staffFound.gender
              temp.email = staffFound.email
              temp.role = staffFound.roleOfAcademicMember
              temp.dayoff = staffFound.dayoff
              temp.location = staffFound.locationName

              OUTPUT.push(temp)
            }
        }
      }
    } else {
      var flag = false
      for (i = 0; i < courses.length; i++) {
        if (courses[i] == Course) {
          flag = true
        }
      }
      if (!flag) {
        res.json({ error: 'This course doesnot exist in the department' })
      } else {
        for (j = 0; j < staff.length; j++) {
          var staff_id = staff[j]

          const staffFound = await staffModel.findOne({ id: staff_id })

          for (x = 0; x < staffFound.courses.length; x++) {
            if (staffFound.courses[x] == Course) {
              var temp = {}
              temp.course = Course
              temp.id = staff_id
              temp.name = staffFound.name
              temp.salary = staffFound.salary
              temp.gender = staffFound.gender
              temp.email = staffFound.email
              temp.role = staffFound.roleOfAcademicMember
              temp.dayoff = staffFound.dayoff
              temp.location = staffFound.locationName

              //
              OUTPUT.push(temp)
            }
          }
        }
      }
    }
    res.json({ staffoncoursesindep: OUTPUT, statuscode: success })
  } catch (exception) {
    //console.log(exception)
    return res.json({
      error: 'Something went wrong',
      statuscode: statusCodes.unknown,
    })
  }
}

const viewStaffIDayOff = async (req, res, next) => {
  try {
    const HOD_ID = req.data.id
    var OUTPUT = []
    const departmentFound = await departmentModel.findOne({
      headOfDepartmentId: HOD_ID,
    })

    const staff = departmentFound.staff
    if (req.body.staff_id) {
      var OUTPUT = []
      // if a single staff
      const idd = req.body.staff_id
      const staffFound = await staffModel.findOne({ id: idd })

      var temp = {}
      for (i = 0; i < staff.length; i++) {
        if (idd == staff[i]) {
          const staffFound = await staffModel.findOne({ id: idd })
          if (staffFound) {
            temp.id = staffFound.id
            temp.name = staffFound.name
            temp.dayoff = staffFound.dayoff
          }
        }
      }
      if (temp.id == null) {
        OUTPUT.push(temp)
        res.json({ staffdaysoff: OUTPUT })
      } else {
        OUTPUT.push(temp)
        res.json({ staffdaysoff: OUTPUT, statuscode: success })
      }
    } else {
      // all the staff

      var OUTPUT = []

      const staffFound = await staffModel.find({
        departmentName: departmentFound.name,
      })
      return res.json({ staffdaysoff: staffFound, statuscode: success })
    }
  } catch (exception) {
    console.log(exception)
    return res.json({
      error: 'Something went wrong',
      statuscode: statusCodes.unknown,
    })
  }
}

const assignCourseInstructor = async (req, res, next) => {
  try {
    const HODId = req.data.id
    //const HODId=req.body.HODid // di hatetshal w han uncomment el fo2 ma3 el token
    const ciId = req.body.courseInstId
    const courseCode = req.body.courseCode
    const departments = await departmentModel.findOne({
      headOfDepartmentId: HODId,
    })
    const getCoursesInDep = departments.courses
    const courseExistHOD = getCoursesInDep.indexOf(courseCode)
    if (courseExistHOD < 0) {
      res.json({ error: 'course does not exist in the department of HOD' })
    }
    const staffs = await staffModel.findOne({ id: ciId })
    if (!staffs || staffs.role !== 'AcademicMember') {
      return res.json({ error: 'Academic Member does not exist' })
    }
    //  const getStaffCourses=staffs.courses
    //  const courseExistCI=getStaffCourses.indexOf(courseCode)
    //  if(courseExistCI<0){
    //      res.json({error:'course instructor does not teach this course'})
    //  }
    await staffModel.findOneAndUpdate(
      { id: ciId },
      { roleOfAcademicMember: 'CourseInstructor' },
      { useFindAndModify: false }
    )
    await coursesModel.findOneAndUpdate(
      { code: courseCode },
      { courseInstructorId: ciId },
      { useFindAndModify: false }
    )
    const coursesArray = staffs.courses
    coursesArray.push(courseCode)
    await staffModel.findOneAndUpdate(
      { id: ciId },
      { courses: coursesArray },
      { useFindAndModify: false }
    )

    // const depOfHOD= await departmentModel.findOne({headOfDepartmentId:HODId})
    // if(!depOfHOD){
    //     return res.json({error:'Head of department not found',statuscode:errorCodes.HeadOfDepartmentNotFound})
    // }
    // const coursesInThisDep = depOfHOD.coursesCode
    // if(coursesInThisDep.length==0){
    //     return res.json({error:'No courses found in this department',statuscode:errorCodes.NoCoursesInThisDepartment})
    // }
    // const courseInstId = req.body.courseInstId
    // const getCourseInst= await staffModel.findOne({id:courseInstId})
    // if(!getCourseInst){
    //     return res.json({error:'staff not found',statuscode:errorCodes.staffNotFound})
    // }
    // const depOfCourseInst = getCourseInst.departmentName
    // if(depOfCourseInst==null){
    //     return res.json({error:'staff does not have department',statuscode:errorCodes.staffDoesNotHaveDepartment})
    // }
    // if(depOfHOD.name!==depOfCourseInst){
    //     return res.json({error:'Course Instructor not in the same department',statuscode:errorCodes.instNotInSameDep})
    // }
    // coursesInThisDep.forEach(async(course)=>{
    //     await coursesModel.findOneAndUpdate({code:course},{courseInstructorId:courseInstId},{
    //         useFindAndModify: false})
    // })
    res.json({ statuscode: statusCodes.success, message: 'success' })
  } catch (exception) {
    return res.json({
      error: 'Something went wrong',
      statuscode: statusCodes.unknown,
    })
  }
}
const deleteCourseInstructor = async (req, res, next) => {
  try {
    const HODId = req.data.id
    //const HODId=req.body.HODid // di hatetshal w han uncomment el fo2 ma3 el token
    const ciId = req.body.courseInstId
    const courseCode = req.body.courseCode
    const departments = await departmentModel.findOne({
      headOfDepartmentId: HODId,
    })
    const getCoursesInDep = departments.courses
    const courseExistHOD = getCoursesInDep.indexOf(courseCode)
    if (courseExistHOD < 0) {
      res.json({ error: 'course does not exist in the department of HOD' })
    }
    const staffs = await staffModel.findOne({ id: ciId })
    if (!staffs || staffs.role !== 'AcademicMember') {
      return res.json({ error: 'Academic Member does not exist' })
    }
    const getStaffCourses = staffs.courses
    const courseExistCI = getStaffCourses.indexOf(courseCode)
    if (courseExistCI < 0) {
      res.json({ error: 'course instructor does not teach this course' })
    }
    await staffModel.findOneAndUpdate(
      { id: ciId },
      { $unset: { roleOfAcademicMember: 1 } },
      { useFindAndModify: false }
    )
    await coursesModel.findOneAndUpdate(
      { code: courseCode },
      { $unset: { courseInstructorId: 1 } },
      { useFindAndModify: false }
    )

    // const HODId=req.data.id
    //     const HODId=req.body.HODid // di hatetshal w han uncomment el fo2 ma3 el token
    //     const depOfHOD= await departmentModel.findOne({headOfDepartmentId:HODId})
    //     if(!depOfHOD){
    //         return res.json({error:'Head of department not found',statuscode:errorCodes.HeadOfDepartmentNotFound})
    //     }
    //     const courseInstId=req.body.courseInstId
    //     const courseInst = await staffModel.findOne({id:courseInstId})
    //     if(!courseInst){
    //     return res.json({error:'course instructor not found',statuscode:errorCodes.courseInstructorNotFound})
    //     }

    //    const depOfCourseInst = courseInst.departmentName
    //    if(depOfCourseInst==null){
    //     return res.json({error:'staff does not have department',statuscode:errorCodes.staffDoesNotHaveDepartment})
    // }
    //     //await staffModel.findOneAndUpdate({id:courseInstId},{$unset:{roleOfAcademicMember:1}},{
    //     //    useFindAndModify: false})

    // if(depOfHOD.name!==depOfCourseInst){
    //     return res.json({error:'Course Instructor not in the same department',statuscode:errorCodes.instNotInSameDep})
    // }
    //     await coursesModel.updateMany({courseInstructorId:courseInstId},{$unset:{courseInstructorId:1}})

    res.json({ statuscode: statusCodes.success, message: 'success' })
  } catch (exception) {
    return res.json({
      error: 'Something went wrong',
      statuscode: statusCodes.unknown,
    })
  }
}
const updateCourseInstructor = async (req, res, next) => {
  try {
    const HODId = req.data.id
    // const HODId=req.body.HODid // di hatetshal w han uncomment el fo2 ma3 el token
    const ciId = req.body.courseInstId
    const courseCode = req.body.courseCode
    const departments = await departmentModel.findOne({
      headOfDepartmentId: HODId,
    })
    const getCoursesInDep = departments.courses
    const courseExistHOD = getCoursesInDep.indexOf(courseCode)
    if (courseExistHOD < 0) {
      res.json({ error: 'course does not exist in the department of HOD' })
    }
    const staffs = await staffModel.findOne({ id: ciId })
    if (!staffs || staffs.role !== 'AcademicMember') {
      return res.json({ error: 'Academic Member does not exist' })
    }
    if (staffs.roleOfAcademicMember !== 'CourseInstructor') {
      return res.json({ error: 'not a courseInstructor' })
    }
    const getStaffCourses = staffs.courses
    const courseExistCI = getStaffCourses.indexOf(courseCode)
    //  if(courseExistCI<0){
    //      res.json({error:'course instructor does not teach this course'})
    //  }
    // await coursesModel.findOneAndUpdate({courseInstructorId:ciId},{$unset:{courseInstructorId:1}},{ useFindAndModify: false})
    await coursesModel.findOneAndUpdate(
      { code: courseCode },
      { courseInstructorId: ciId },
      { useFindAndModify: false }
    )

    //  // const HODId=req.data.id
    //  const HODId=req.body.HODid // di hatetshal w han uncomment el fo2 ma3 el token
    //  const depOfHOD= await departmentModel.findOne({headOfDepartmentId:HODId})
    //  if(!depOfHOD){
    //     return res.json({error:'Head of department not found',statuscode:errorCodes.HeadOfDepartmentNotFound})
    // }
    //  const coursesOfDep = depOfHOD.coursesCode
    //  const exist = coursesOfDep.indexOf(req.body.courseCode)
    //  if(exist<0){
    //     return res.json({error:'Department does not have this course',statuscode:errorCodes.DepDoesNotHaveThisCourse})

    //  }
    //  const courseInstId=req.body.courseInstId
    //  const courseInst = await staffModel.findOne({id:courseInstId})
    //  if(!courseInst){
    //  return res.json({error:'course instructor not found',statuscode:errorCodes.courseInstructorNotFound})
    //  }
    //  if(courseInst.roleOfAcademicMember!=="CourseInstructor"){
    //  return res.json({error:'not a course instructor',statuscode:errorCodes.notACourseInstructor})
    //  }

    // const depOfCourseInst = courseInst.departmentName
    // if(depOfCourseInst==null){
    //  return res.json({error:'staff does not have department',statuscode:errorCodes.staffDoesNotHaveDepartment})
    // }

    // if(depOfHOD.name!==depOfCourseInst){
    //  return res.json({error:'Course Instructor not in the same department',statuscode:errorCodes.instNotInSameDep})
    // }

    // await coursesModel.findOneAndUpdate({code:req.body.courseCode},{courseInstructorId:req.body.courseInstId},{
    //     useFindAndModify: false})
    res.json({ statuscode: statusCodes.success, message: 'success' })
  } catch (exception) {
    return res.json({
      error: 'Something went wrong',
      statuscode: statusCodes.unknown,
    })
  }
}

module.exports = {
  viewAllRequests,
  acceptRequest,
  rejectRequest,
  viewCoursesCoverage,
  viewTeachingAssHOD,

  viewAllStaff,
  viewAllStaffPerCourse,
  viewStaffIDayOff,
  assignCourseInstructor,
  deleteCourseInstructor,
  updateCourseInstructor,
}
