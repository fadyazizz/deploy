const statusCodes = require('../constants/statusCodes')
const scheduleModel = require('../../models/schedule')
const assignmentModel = require('../../models/assignment')
const { coursesModel } = require('../../models/courses')

const facultyModel = require('../../models/faculty')

const { departmentModel } = require('../../models/department')
const locationModel = require('../../models/location')

const { NoCoursesforyou } = require('../errorCodes')
const { success } = require('../constants/statusCodes')
const Joi = require('joi')
const staffModel = require('../../models/staff')
const requestSlotLinkingModel = require('../../models/requestSlotLinking')

const errorCodes = require('../errorCodes')

const viewCoursesCoverageCI = async (req, res, next) => {
  //hod view courses coverage in his dep
  try {
    var result = []
    var displaycourse = []
    const staffblock = await staffModel.findOne({ id: req.data.id })
    if (staffblock) {
      const idCI = staffblock.id

      for (i = 0; i < staffblock.courses.length; i++) {
        const getAyhaga = await coursesModel.findOne({
          code: staffblock.courses[i],
        })
        displaycourse.push(getAyhaga)

        if (!(displaycourse == [])) {
          const courseC =
            displaycourse[i].signedSlot / displaycourse[i].totalSlots
          await coursesModel.update(
            { code: staffblock.courses[i] },
            { courseCoverage: courseC }
          )

          var temp = {}

          const cc = await coursesModel.findOne({ courseCoverage: courseC })
          temp.coursecode = displaycourse[i].code
          temp.CourseCoverage = cc.courseCoverage

          result.push(temp)
        }
      }
      if (staffblock.courses.length == 0) {
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
    }
  } catch (exception) {
    console.log(exception)
    return res.json({
      error: 'Something went wrong',
      statuscode: statusCodes.unknown,
    })
  }
}

const viewUnassignedSlots = async (req, res, next) => {
  try {
    var all = []
    var allnew = []
    const foundid = await staffModel.findOne({
      id: req.data.id,
    })

    for (i = 0; i < foundid.courses.length; i++) {
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
const assignAcademicMemberToSlots = async (req, res, next) => {
  try {
    const staffId = req.body.staffId
    const typeOfSlot = req.body.typeOfSlot
    const courseCode = req.body.courseCode
    const location = req.body.location
    const day = req.body.day
    const slotName = req.body.slotName
    const staffFound = await staffModel.findOne({ id: staffId })
    if (!staffFound) {
      return res.json({ error: 'staff does not exist' })
    }
    const slotFound = await scheduleModel.findOne({
      slotName: slotName,
      day: day,
      typeOfSlot: typeOfSlot,
      location: location,
      courseCode: courseCode,
    })

    if (!slotFound) {
      return res.json({ error: 'slot does not exist' })
    }
    if (slotFound.staffId) {
      return res.json({ error: 'this slot is already assigned' })
    }
    const staffCourses = staffFound.courses
    const staffCourse = staffCourses.indexOf(courseCode)
    if (staffCourse < 0) {
      return res.json({ error: 'staff does not teach this course' })
    }
    await scheduleModel.findOneAndUpdate(
      {
        slotName: slotName,
        day: day,
        typeOfSlot: typeOfSlot,
        location: location,
        courseCode: courseCode,
      },
      { staffId: staffId },
      { useFindAndModify: false }
    )
    //bazawed signedSlot b 1 f courses model
    const course = await coursesModel.findOne({ code: courseCode })
    if (course.signedSlot == null) {
      await coursesModel.findOneAndUpdate(
        { code: courseCode },
        { signedSlot: 0 },
        { useFindAndModify: false }
      )
    }
    const signedslotcourse = await coursesModel.findOne({ code: courseCode })
    const signedSlotInCourse = signedslotcourse.signedSlot
    const incrementSignedSlot = signedSlotInCourse + 1
    await coursesModel.findOneAndUpdate(
      { code: courseCode },
      { signedSlot: incrementSignedSlot },
      { useFindAndModify: false }
    )

    return res.json({ statuscode: statusCodes.success, message: 'success' })
    // const CourseInstructor_id = req.data.id

    // const staff_Id = req.body.staffId

    // const typeOfSlot = req.body.typeOfSlot
    // const CouseCode = req.body.courseCode
    // const location = req.body.location
    // const day = req.body.day
    // const slotName = req.body.slotName
    // // const timing = req.body.timing

    // const courseFound = await coursesModel.findOne({ code: CouseCode })
    // if (!courseFound) {
    //   return res.json({ error: 'course not found' })
    // }

    // if (courseFound.courseCoordinatorId == CourseInstructor_id) {
    //   const temp = 1 + courseFound.signedSlot
    //   var x = temp / courseFound.totalSlots

    //   const Staff = courseFound.staffId
    //   var flag = false

    //   if (temp < courseFound.totalSlots) {
    //     for (i = 0; i < Staff.length; i++) {
    //       if (staff_Id == Staff[i]) {
    //         flag = true
    //       }
    //     }

    //     if (flag) {
    //       const schedulFound = await scheduleModel.findOne({
    //         slotName: req.body.slotName,
    //         day: req.body.day,
    //         typeOfSlot: req.body.typeOfSlot,
    //         location: req.body.location,
    //         // timing: req.body.timing,
    //         courseCode: req.body.courseCode,
    //       })

    //       if (!schedulFound) {
    //         return res.json({ error: 'this slot doesnot exist ' })
    //       }

    //       if (schedulFound.staffId) {
    //         return res.json({
    //           error: 'this exactly slot is already signed',
    //           statuscode: statusCodes.unknown,
    //         })
    //       } else {
    //         await scheduleModel.updateOne(
    //           {
    //             slotName: slotName,
    //             day: day,
    //             typeOfSlot: typeOfSlot,
    //             location: location,

    //             courseCode: CouseCode,
    //           },
    //           {
    //             staffId: staff_Id,
    //           }
    //         )

    //         await coursesModel.update(
    //           {
    //             code: CouseCode,
    //           },
    //           {
    //             signedSlot: temp,
    //             courseCoverage: x,
    //           }
    //         )
    //         const Mess = ' assigned successfuly! '
    //         return res.json({ Mess, statuscode: statusCodes.success })
    //       }
    //     } else {
    //       return res.json({
    //         error: 'this AcademicMember is not assigned to this course ',
    //         statuscode: statusCodes.unknown,
    //       })
    //     }
    //   } else {
    //     return res.json({
    //       error: 'You have exceede the limit of slots for this Course ',
    //       statuscode: statusCodes.unknown,
    //     })
    //   }
    // } else {
    //   return res.json({
    //     error: 'You Are an instructor for this course ',
    //     statuscode: statusCodes.unknown,
    //   })
    // }
  } catch (exception) {
    //console.log(exception)
    return res.json({
      error: 'Something went wrong',
      statuscode: statusCodes.unknown,
    })
  }
}

const upateAssignmenttAcademicMemberToSlots = async (req, res, next) => {
  try {
    const CourseInstructor_id = req.data.id

    const staff_Id = req.body.staffId

    const typeOfSlot = req.body.typeOfSlot
    const CouseCode = req.body.courseCode
    const location = req.body.location
    const day = req.body.day
    const slotName = req.body.slotName
    // const timing = req.body.timing

    const courseFound = await coursesModel.findOne({ code: CouseCode })
    if (!courseFound) {
      return res.json({ error: 'course not found' })
    }

    if (courseFound.courseCoordinatorId == CourseInstructor_id) {
      const Staff = courseFound.staffId

      var flag = false

      for (i = 0; i < Staff.length; i++) {
        if (staff_Id == Staff[i]) {
          flag = true
        }
      }

      if (flag == true) {
        const schedulFound = await scheduleModel.find({
          slotName: slotName,
          day: day,
          typeOfSlot: typeOfSlot,
          location: location,

          //  timing: timing,
          courseCode: CouseCode,
        })

        if (!schedulFound) {
          return res.json({ error: 'this slot doesnot exist ' })
        }

        await scheduleModel.update(
          {
            slotName: slotName,
            day: day,
            typeOfSlot: typeOfSlot,
            location: location,

            //   timing: timing,
            courseCode: CouseCode,
          },
          {
            staffId: staff_Id,
          }
        )

        const Mess = ' updated successfuly! '
        return res.json({ Mess, statuscode: statusCodes.success })
      } else {
        return res.json({
          error: 'this AcademicMember is not assigned to this course ',
          statuscode: statusCodes.unknown,
        })
      }
    } else {
      return res.json({
        error: 'You Are an instructor for this course ',
        statuscode: statusCodes.unknown,
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

const deleteAssignmentAcademicMemberToSlots = async (req, res, next) => {
  try {
    const CourseInstructor_id = req.data.id

    const staff_Id = req.body.staffId

    const typeOfSlot = req.body.typeOfSlot
    const CouseCode = req.body.courseCode
    const location = req.body.location
    const day = req.body.day
    const slotName = req.body.slotName
    //  const timing = req.body.timing

    const courseFound = await coursesModel.findOne({ code: CouseCode })
    if (!courseFound) {
      return res.json({ error: 'course not found' })
    }

    if (courseFound.courseCoordinatorId == CourseInstructor_id) {
      const temp = courseFound.signedSlot - 1
      var x = temp / courseFound.totalSlots
      const Staff = courseFound.staffId
      var flag = false

      if (temp < courseFound.totalSlots) {
        for (i = 0; i < Staff.length; i++) {
          if (staff_Id == Staff[i]) {
            flag = true
          }
        }

        if (flag == true) {
          const schedulFound = await scheduleModel.findOne({
            slotName: slotName,
            day: day,
            typeOfSlot: typeOfSlot,
            location: location,

            //timing: timing,
            courseCode: CouseCode,
          })

          if (!schedulFound) {
            return res.json({ error: 'this slot doesnot exist ' })
          }

          if (schedulFound.staffId != staff_Id) {
            return res.json({
              error: 'this exactly slot is not signed to this AcademicMember',
              statuscode: statusCodes.unknown,
            })
          } else {
            await scheduleModel.update(
              {
                courseCode: CouseCode,
                typeOfSlot: typeOfSlot,
                location: location,
                day: day,
                slotName: slotName,
                // timing: timing,
              },
              {
                staffId: null,
              }
            )

            await coursesModel.update(
              {
                code: CouseCode,
              },
              {
                signedSlot: temp,
                courseCoverage: x,
              }
            )
            const Mess = ' delted successfuly! '
            return res.json({ Mess, statuscode: statusCodes.success })
          }
        } else {
          return res.json({
            error: 'this AcademicMember is not assigned to this course ',
            statuscode: statusCodes.unknown,
          })
        }
      }
    } else {
      return res.json({
        error: 'You Are an instructor for this course ',
        statuscode: statusCodes.unknown,
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

const deleteCourseAssignment = async (req, res, next) => {
  try {
    const staff_id = req.body.staffId
    const courseCode = req.body.courseCode

    const CourseInstructor_id = req.data.id

    const courseFound = await coursesModel.findOne({ code: courseCode })
    if (courseFound.courseCoordinatorId != CourseInstructor_id) {
      return res.json({
        error: 'You Are an instructor for this course ',
        statuscode: statusCodes.unknown,
      })
    }
    var flag = false
    const staffFound = courseFound.staffId
    var i = 0
    while (i < staffFound.length) {
      if (staffFound[i] === staff_id) {
        staffFound.splice(i, 1)
        flag = true
      } else {
        ++i
      }
    }

    if (!flag) {
      return res.json({
        error: 'UN ACCURATE DATA',
      })
    }
    var flag2 = false
    const sFound = await staffModel.findOne({ id: staff_id })

    const coursesFound = sFound.courses
    var i = 0
    while (i < coursesFound.length) {
      if (coursesFound[i] === courseCode) {
        coursesFound.splice(i, 1)
        flag2 = true
      } else {
        ++i
      }
    }

    if (!flag2) {
      return res.json({
        error: 'UN ACCURATE DATA',
      })
    }

    const schedFound = await staffModel.find({
      courseCode: courseCode,
      staffId: staff_id,
    })

    if (schedFound) {
      const minus = schedFound.length
      const newSign = courseFound.signedSlot - minus
      const newCover = newSign / courseFound.totalSlots

      await scheduleModel.update(
        {
          courseCode: courseCode,
          staffId: staff_id,
        },
        {
          staffId: null,
        }
      )
      await coursesModel.updateOne(
        {
          code: courseCode,
        },
        {
          staffId: staffFound,
          signedSlot: newSign,
          newCover: newCover,
        }
      )
    }

    await coursesModel.updateOne(
      {
        code: courseCode,
      },
      {
        staffId: staffFound,
      }
    )

    await staffModel.updateOne(
      {
        id: staff_id,
      },
      {
        courses: coursesFound,
      }
    )

    return res.json({
      error: 'Deleted succufully',
      statuscode: statusCodes.success,
    })
  } catch (exception) {
    return res.json({
      error: 'Something went wrong',
      statuscode: statusCodes.unknown,
    })
  }
}

const assignmentAcademicToCourse = async (req, res, next) => {
  try {
    const staffId = req.body.staffId
    const courseCode = req.body.courseCode
    const ciId = req.data.id
    const staffExist = await staffModel.findOne({ id: staffId })
    if (!staffExist) {
      return res.json({ error: 'staff does not exist' })
    }
    if (staffExist.roleOfAcademicMember !== 'TA') {
      return res.json({ error: 'Staff is not a TA' })
    }
    const courseExist = await coursesModel.findOne({ code: courseCode })
    if (!courseExist) {
      return res.json({ error: 'course does not exist' })
    }
    const ciOfThisCourse = courseExist.courseInstructorId
    if (ciOfThisCourse !== ciId) {
      return res.json({ error: 'you are not an instructor for this course' })
    }
    const staffDepartment = staffExist.departmentName
    const dep = await departmentModel.findOne({ name: staffDepartment })
    const coursesInDep = dep.courses
    const courseExistInDep = coursesInDep.indexOf(courseCode)
    if (courseExistInDep < 0) {
      return res.json({
        error: 'course does not exist in the department of the staff',
      })
    }
    //ahot el staff f array of staff in course model
    const staffArray = courseExist.staffId
    const indxOfStaff = staffArray.indexOf(staffId)
    if (indxOfStaff >= 0) {
      return res.json({ error: 'staff already assigned to this course' })
    }
    staffArray.push(staffId)
    await coursesModel.findOneAndUpdate(
      { code: courseCode },
      { staffId: staffArray },
      { useFindAndModify: false }
    )
    //ahot el course f array of course in staff model
    const courseArray = staffExist.courses
    courseArray.push(courseCode)
    await staffModel.findOneAndUpdate(
      { id: staffId },
      { courses: courseArray },
      { useFindAndModify: false }
    )

    return res.json({ statuscode: statusCodes.success, message: 'success' })
  } catch (exception) {
    return res.json({
      error: 'Something went wrong',
      statuscode: statusCodes.unknown,
    })
  }
}

const viewSlotsAssignment = async (req, res, next) => {
  try {
    const courseInstId = req.data.id
    //const courseInstId = req.body.courseInstId
    const getStaff = await staffModel.findOne({ id: courseInstId })
    const CIcourses = getStaff.courses
    var result = []
    for (i = 0; i < CIcourses.length; i++) {
      const schedulesOfCourses = await scheduleModel.find({
        courseCode: CIcourses[i],
      })
      for (j = 0; j < schedulesOfCourses.length; j++) {
        const staffInThisCourse = schedulesOfCourses[j].staffId
        if (!staffInThisCourse) {
          // console.log("next")
        } else {
          var temp = {}
          temp.staffId = schedulesOfCourses[j].staffId
          temp.slotName = schedulesOfCourses[j].slotName
          temp.day = schedulesOfCourses[j].day
          temp.location = schedulesOfCourses[j].location
          temp.typeOfSlot = schedulesOfCourses[j].typeOfSlot
          temp.timing = schedulesOfCourses[j].timing
          temp.courseCode = schedulesOfCourses[j].courseCode
          result.push(temp)
        }
      }
    }
    res.json({
      statuscode: success,
      slotsAssignment: result,
    })
  } catch (exception) {
    console.log(exception)
    return res.json({
      error: 'Something went wrong',
      statuscode: statusCodes.unknown,
    })
  }
}
const viewStaffInMyDepartment = async (req, res, next) => {
  try {
    const courseInstId = req.data.id
    //const courseInstId = req.body.courseInstId
    const depOfCourseInst = await staffModel.findOne({ id: courseInstId })
    // if (!depOfCourseInst) {
    //   return res.json({
    //     error: 'course instructor not found',
    //     statuscode: errorCodes.courseInstructorNotFound,
    //   })
    // }
    const departmentOfCI = depOfCourseInst.departmentName
    if (!departmentOfCI == null) {
      return res.json({
        error: 'course instructor does not have department',
        statuscode: errorCodes.staffDoesNotHaveDepartment,
      })
    }
    const departmentt = await departmentModel.findOne({ name: departmentOfCI })
    const staffsInDep = departmentt.staff
    var result = []
    for (i = 0; i < staffsInDep.length; i++) {
      var temp = {}
      const staffProfile = await staffModel.findOne({ id: staffsInDep[i] })
      if (staffProfile) {
        temp.id = staffProfile.id
        temp.gender = staffProfile.gender
        temp.name = staffProfile.name
        temp.email = staffProfile.email
        temp.location = staffProfile.locationName
        temp.dayOff = staffProfile.dayoff
        temp.dep = staffProfile.departmentName
        result.push(temp)
      }
    }

    return res.json({ staffsProfile: result, statuscode: success })
  } catch (exception) {
    return res.json({
      error: 'Something went wrong',
      statuscode: statusCodes.unknown,
    })
  }
}

const viewStaffInMyCourses = async (req, res, next) => {
  try {
    const courseInstId = req.data.id
    //const courseInstId = req.body.courseInstId
    const courseInst = await staffModel.findOne({ id: courseInstId })
    const coursesOfCI = courseInst.courses
    var result = []
    for (i = 0; i < coursesOfCI.length; i++) {
      var temp = {}
      const courseInfo = await coursesModel.findOne({ code: coursesOfCI[i] })
      temp.courseCode = courseInfo.code
      temp.staffsInMyCourses = courseInfo.staffId
      for (j = 0; j < courseInfo.staffId.length; j++) {
        const staffsInCourse = await staffModel.findOne({
          id: courseInfo.staffId[j],
        })
        if (staffsInCourse) {
          temp.id = staffsInCourse.id
          temp.gender = staffsInCourse.gender
          temp.name = staffsInCourse.name
          temp.email = staffsInCourse.email
          temp.location = staffsInCourse.locationName
          temp.dayOff = staffsInCourse.dayoff
          temp.dep = staffsInCourse.departmentName
        }
      }
      result.push(temp)
    }
    return res.json({ staffInMyCourses: result, statuscode: success })
  } catch (exception) {
    return res.json({
      error: 'Something went wrong',
      statuscode: statusCodes.unknown,
    })
  }
}
const viewStaffPerCourse = async (req, res, next) => {
  try {
    const ciID = req.data.id
    const courseCode = req.body.courseCode
    const ci = await staffModel.findOne({ id: ciID })
    const ciCourses = ci.courses
    const courseExist = ciCourses.indexOf(courseCode)

    if (courseExist < 0) {
      return res.json({
        error: 'The course instructor does not teach this course!',
      })
    }
    const theCourse = await coursesModel.findOne({ code: courseCode })
    if (theCourse) {
      const staffInThisCourse = theCourse.staffId

      var result = []
      for (i = 0; i < staffInThisCourse.length; i++) {
        var temp = {}

        const staff = await staffModel.findOne({ id: staffInThisCourse[i] })
        if (staff) {
          temp.id = staff.id
          temp.name = staff.name
          temp.gender = staff.gender
          temp.email = staff.email
          temp.location = staff.locationName
          temp.dayOff = staff.dayoff
          temp.dep = staff.departmentName
          result.push(temp)
        }
      }
    }
    return res.json({ staffInThisCourse: result, statuscode: success })
  } catch (exception) {
    console.log(exception)
    return res.json({
      error: 'Something went wrong',
      statuscode: statusCodes.unknown,
    })
  }
}
const removeAcademicMember = async (req, res, next) => {
  try {
    const ciId = req.data.id
    //const ciId=req.body.courseInstId
    const acId = req.body.academicMemberId
    const courseCode = req.body.courseCode
    const staffs1 = await staffModel.findOne({ id: ciId })
    const coursesOfCI = staffs1.courses
    const courseExistCI = coursesOfCI.indexOf(courseCode)
    if (courseExistCI < 0) {
      return res.json({ error: 'course Instructor does not have this course' })
    }
    const staffs2 = await staffModel.findOne({ id: acId })
    if (!staffs2) {
      return res.json({ error: 'Academic member does not exist' })
    }
    const coursesOfAC = staffs2.courses
    const courseExistAC = coursesOfAC.indexOf(courseCode)
    if (courseExistAC < 0) {
      return res.json({ error: 'Academic member does not have this course' })
    }
    coursesOfAC.splice(courseExistAC, 1)
    await staffModel.findOneAndUpdate(
      { id: acId },
      { courses: coursesOfAC },
      { useFindAndModify: false }
    )
    const coursesM = await coursesModel.findOne({ code: courseCode })
    const arrayOfStaff = coursesM.staffId
    const indexStaff = arrayOfStaff.indexOf(acId)
    arrayOfStaff.splice(indexStaff, 1)
    await coursesModel.findOneAndUpdate(
      { code: courseCode },
      { staffId: arrayOfStaff },
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

const assignAcademicMemberToCourseCoordinator = async (req, res, next) => {
  try {
    const courseInstId = req.data.id
    //const courseInstId = req.body.courseInstId
    const acId = req.body.academicMemberId
    const elCourse = req.body.courseCode
    const courseInstInfo = await staffModel.findOne({ id: courseInstId })
    const coursesOfCourseInst = courseInstInfo.courses
    const courseExistCI = coursesOfCourseInst.indexOf(elCourse)
    if (courseExistCI < 0) {
      return res.json({ error: 'Course Instructor does not teach this course' })
    }
    const academicMemberInfo = await staffModel.findOne({ id: acId })
    if (!academicMemberInfo || academicMemberInfo.role !== 'AcademicMember') {
      return res.json({ error: 'Academic Member does not exist' })
    }
    // const academicMemberCourses = academicMemberInfo.courses
    // const courseExistAC = academicMemberCourses.indexOf(elCourse)
    // if (courseExistAC < 0) {
    //   return res.json({ error: 'Academic Member does not teach this course' })
    // }
    await staffModel.findOneAndUpdate(
      { id: acId },
      { roleOfAcademicMember: 'CourseCoordinator' },
      { useFindAndModify: false }
    )
    await coursesModel.findOneAndUpdate(
      { code: elCourse },
      { courseCoordinatorId: acId },
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

module.exports = {
  assignAcademicMemberToSlots,
  deleteAssignmentAcademicMemberToSlots,
  upateAssignmenttAcademicMemberToSlots,
  viewCoursesCoverageCI,
  viewStaffInMyDepartment,
  viewStaffInMyCourses,
  viewSlotsAssignment,
  assignAcademicMemberToCourseCoordinator,
  removeAcademicMember,
  viewStaffPerCourse,
  assignmentAcademicToCourse,
  deleteCourseAssignment,
  viewUnassignedSlots,
}
