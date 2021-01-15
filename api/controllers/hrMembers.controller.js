const counterModel = require('../../models/counters')
const { coursesModel } = require('../../models/courses')
const { departmentModel } = require('../../models/department')
const facultyModel = require('../../models/faculty')

const locationModel = require('../../models/location')
const scheduleModel = require('../../models/schedule')

const notificationModel = require('../../models/notification')
const attendanceModel = require('../../models/attendance')
const staffModel = require('../../models/staff')
const bcrypt = require('bcryptjs')
const { salt } = require('../../config/keys_dev')
const statusCodes = require('../constants/statusCodes')
const errorCodes = require('../errorCodes')
const Joi = require('joi')
const days = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
]
const {
  Cantassignhrashod,
  invalidfaculty,
  NOTaValidFacultyorHOD,
  unvaliddepartment,
  unvalidlocation,
  staffNotFound,
  SignInLaterThanSignUp,
  youCannotAddSignInOutToYourself,
  noCoresspondingSignOut,
} = require('../errorCodes')
const { Mongoose } = require('mongoose')
const hodRequestsModel = require('../../models/hodRequests')
const requestSlotLinkingModel = require('../../models/requestSlotLinking')
const assignmentModel = require('../../models/assignment')

const addLocation = async (req, res, next) => {
  try {
    const locationExist = await locationModel.findOne({
      location: req.body.location,
    })
    if (locationExist) {
      return res.json({
        error: 'location already exist',
      })
    }
    await locationModel.create(req.body)

    res.json({ statuscode: statusCodes.success, message: 'success' })
  } catch (exception) {
    //console.log(exception)
    return res.json({
      error: 'Something went wrong',
      statuscode: statusCodes.unknown,
    })
  }
}
const updateLocation = async (req, res, next) => {
  try {
    const validname = await locationModel.findOne({
      location: req.body.location,
    })

    if (validname) {
      const validloc = req.body.location
      if (!(req.body.capacity == null)) {
        await locationModel.updateMany(
          { location: validloc },
          { $set: { capacity: req.body.capacity } }
        )
      }

      if (!(req.body.typeOfLocation == null)) {
        await locationModel.updateMany(
          { location: validloc },
          { $set: { typeOfLocation: req.body.typeOfLocation } }
        )
      }
      if (!(req.body.updatedLocationName == null)) {
        await locationModel.updateMany(
          { location: validloc },
          { $set: { location: req.body.updatedLocationName } }
        )
        await staffModel.updateMany(
          { locationName: validloc },
          { $set: { locationName: req.body.updatedLocationName } }
        )
        await scheduleModel.updateMany(
          { locationName: validloc },
          { $set: { locationName: req.body.updatedLocationName } }
        )
      }

      res.json({ statuscode: statusCodes.success, message: 'success' })
    } else {
      return res.json({
        error: 'invalid location name',
        statuscode: unvalidlocation,
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

const updateStaffSalary = async (req, res, next) => {
  try {
    const validid = await staffModel.findOne({ id: req.body.id })
    if (validid) {
      await staffModel.updateOne(
        { id: req.body.id },
        { salary: req.body.UpdatedSalary }
      )
      res.json({ statuscode: statusCodes.success, message: 'success' })
    } else {
      return res.json({
        error: 'Staff member not found',
        statuscode: staffNotFound,
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

const updateDepartment = async (req, res, next) => {
  try {
    const validname = await departmentModel.findOne({ name: req.body.name })

    if (validname) {
      const validdep = req.body.name
      if (!(req.body.facultyName == null)) {
        const checkiffacultyexist = await facultyModel.findOne({
          name: req.body.facultyName,
        })
        if (checkiffacultyexist) {
          await departmentModel.updateMany(
            { name: validdep },
            { $set: { facultyName: req.body.facultyName } }
          )
        } else {
          return res.json({
            error: 'FACULTY DOESNOT EXIST',
            statuscode: invalidfaculty,
          })
        }
      }

      if (!(req.body.headOfDepartmentId == null)) {
        const checkifidexist = await staffModel.findOne({
          id: req.body.headOfDepartmentId,
        })

        const oldidhod = await departmentModel.findOne({ name: validdep })
        if (oldidhod) {
          const oldidtani = oldidhod.headOfDepartmentId
          await staffModel.updateMany(
            { id: oldidtani },
            { $set: { roleOfAcademicMember: 'CourseInstructor' } }
          )
        }

        if (checkifidexist) {
          const ishr = checkifidexist.role
          if (ishr == 'HR') {
            return res.json({
              error: 'Cant assign HR as headoddepartment  ! ',
              statuscode: Cantassignhrashod,
            })
          }

          await departmentModel.updateMany(
            { name: validdep },
            { $set: { headOfDepartmentId: req.body.headOfDepartmentId } }
          )
          await staffModel.updateMany(
            { id: req.body.headOfDepartmentId },
            { $set: { roleOfAcademicMember: 'HeadOfDepartment' } }
          )
          if (!(req.body.UpdateddepName == null)) {
            await staffModel.updateMany(
              { id: req.body.headOfDepartmentId },
              { $set: { departmentName: req.body.UpdateddepName } }
            )
          } else {
            await staffModel.updateMany(
              { id: req.body.headOfDepartmentId },
              { $set: { departmentName: req.body.name } }
            )
          }
        } else {
          return res.json({
            error: 'Staff not found for hod',
            statuscode: staffNotFound,
          })
        }
      }

      if (!(req.body.staff == null)) {
        for (var i = 0; i < req.body.staff.length; i++) {
          var m = req.body.staff[i]
          const validid = await staffModel.findOne({ id: m })
          //console.log(validid)

          if (validid) {
            const isheeehr = validid.role
            if (isheeehr == 'HR') {
              return res.json({
                error: 'Cant assign HR as staffmember ! ',
                statuscode: Cantassignhrashod,
              })
            } else {
              await departmentModel.updateMany(
                { name: validdep },
                { $set: { staff: req.body.staff } }
              )
              if (req.body.UpdateddepName == null) {
                await staffModel.findOneAndUpdate(
                  { id: m },
                  { departmentName: req.body.name },
                  {
                    useFindAndModify: false,
                  }
                )
              } else {
                await staffModel.findOneAndUpdate(
                  { id: m },
                  { departmentName: req.body.UpdateddepName },
                  {
                    useFindAndModify: false,
                  }
                )
              }
            }
          } else {
            return res.json({
              error: 'Staff not found for staff entrance',
              statuscode: staffNotFound,
            })
          }
        }
      }
      if (!(req.body.UpdateddepName == null)) {
        await departmentModel.updateMany(
          { name: validdep },
          { $set: { name: req.body.UpdateddepName } }
        )

        if (req.body.staff == null) {
          await staffModel.updateMany(
            { departmentName: validdep },
            { $set: { departmentName: req.body.UpdateddepName } }
          )
        } else {
          await staffModel.updateMany(
            { departmentName: req.body.name },
            { $unset: { departmentName: 1 } }
          )
        }
      }

      res.json({ statuscode: statusCodes.success, message: 'success' })
    } else {
      return res.json({
        error: 'invalid department name',
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

const addDepartment = async (req, res, next) => {
  try {
    var m = ''
    const validfaculty = await facultyModel.findOne({
      name: req.body.facultyName,
    })
    const validhod = await staffModel.findOne({
      id: req.body.headOfDepartmentId,
    })

    if (!(req.body.headOfDepartmentId == null) && validhod) {
      const ishr = validhod.role
      if (ishr == 'HR') {
        return res.json({
          error: 'Cant assign  HR as headofdepartment  ! ',
          statuscode: Cantassignhrashod,
        })
      }
      if (!(req.body.staff == null)) {
        for (var i = 0; i < req.body.staff.length; i++) {
          m = req.body.staff[i]
          const validstaffmember = await staffModel.findOne({ id: m })
          if (!validstaffmember) {
            return res.json({
              error:
                'one of Staff members does not exist , you have to make sure all ids are valid for staff array',
            })
          }
          const isheeehr = validstaffmember.role
          if (isheeehr == 'HR') {
            return res.json({
              error: 'Cant assign HR as staff member  ! ',
              statuscode: Cantassignhrashod,
            })
          }
          if (!validstaffmember) {
            return res.json({
              error: 'NOT a Valid Faculty or incorrect staff ',
              statuscode: NOTaValidFacultyorHOD,
            })
          }
        }
      }
      const ishealreadyhod = validhod.roleOfAcademicMember
      if (ishealreadyhod == 'HeadOfDepartment') {
        return res.json({
          error:
            'Cant assign this staff member as headoddepartment as he is already a head fooor other dep! ',
          statuscode: NOTaValidFacultyorHOD,
        })
      } else {
        //console.log('lala')
        await staffModel.updateMany(
          { id: req.body.headOfDepartmentId },
          { $set: { departmentName: req.body.name } }
        )
        await staffModel.updateMany(
          { id: req.body.headOfDepartmentId },
          { $set: { roleOfAcademicMember: 'HeadOfDepartment' } }
        )
      }
    }

    if (!validfaculty || !validhod) {
      res.json({
        error: 'NOT a Valid Faculty or incorrect staff id for hod',
        statuscode: NOTaValidFacultyorHOD,
      })
    } else {
      await departmentModel.create(req.body)

      for (var i = 0; i < req.body.staff.length; i++) {
        m = req.body.staff[i]
        await staffModel.updateMany(
          { id: m },
          { $set: { departmentName: req.body.name } }
        )
      }
      await staffModel.updateMany(
        { id: req.body.headOfDepartmentId },
        { $set: { departmentName: req.body.name } }
      )
      await staffModel.updateMany(
        { id: req.body.headOfDepartmentId },
        { $set: { roleOfAcademicMember: 'HeadOfDepartment' } }
      )
      res.json({ statuscode: statusCodes.success, message: 'success' })
    }
  } catch (exception) {
    console.log(exception)
    return res.json({
      error: 'Something went wrong',
      statuscode: statusCodes.unknown,
    })
  }
}
const deleteDepartment = async (req, res, next) => {
  try {
    const validdep = await departmentModel.findOne({ name: req.body.name })

    await staffModel.updateMany(
      {
        departmentName: req.body.name,
        roleOfAcademicMember: 'HeadOfDepartment',
      },
      { $set: { roleOfAcademicMember: 'CourseInstructor' } }
    )

    //await staffModel.updateMany({departmentName :req.body.name ,roleOfAcademicMember:'HeadOfDepartment'},{$unset:{departmentName:1}})

    if (validdep) {
      // const hodreq = await hodRequestsModel.find({headId:validdep.headOfDepartmentId})
      // if(hodreq){
      //   await hodRequestsModel.deleteMany({headId:validdep.headOfDepartmentId})
      // }
      await departmentModel.findOneAndDelete({ name: req.body.name })

      await staffModel.updateMany(
        { departmentName: req.body.name },
        { $unset: { departmentName: 1 } }
      )

      res.json({ statuscode: statusCodes.success, message: 'success' })
    } else {
      res.json({
        error: 'there is no deparment with this name to delete ',
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

const deleteLocation = async (req, res, next) => {
  try {
    const validloc = await locationModel.findOne({
      location: req.body.locationname,
    })
    console.log(validloc)
    if (validloc) {
      await locationModel.findOneAndDelete({ location: req.body.locationname })
      await staffModel.updateMany(
        { locationName: req.body.locationname },
        { $unset: { locationName: 1 } }
      )
      await scheduleModel.updateMany(
        { locationName: req.body.locationname },
        { $unset: { locationName: 1 } }
      )
      res.json({ statuscode: statusCodes.success, message: 'success' })
    } else {
      res.json({
        error: 'there is no location with this name to delete ',
        statuscode: unvalidlocation,
      })
    }
  } catch (exception) {
    return res.json({
      error: 'Something went wrong',
      statuscode: statusCodes.unknown,
    })
  }
}

const addFaculty = async (req, res, next) => {
  try {
    const facultyExist = await facultyModel.findOne({ name: req.body.name })
    if (facultyExist) {
      return res.json({
        error: 'faculty already exist',
        statuscode: errorCodes.facultyAlreadyExist,
      })
    }
    await facultyModel.create(req.body)
    res.json({ statuscode: statusCodes.success, message: 'success' })
  } catch (exception) {
    return res.json({
      error: 'Something went wrong',
      statuscode: statusCodes.unknown,
    })
  }
}
const updateFaculty = async (req, res, next) => {
  try {
    const facultyFound = await facultyModel.findOne({ name: req.body.name })
    if (!facultyFound) {
      return res.json({
        error: 'faculty not found',
        statuscode: errorCodes.facultyNotFound,
      })
    }
    const objId = facultyFound._id
    // {name:req.body.updatedname,infoAboutFaculty:req.body.infoAboutFaculty}
    await facultyModel.findByIdAndUpdate({ _id: objId }, req.body, {
      useFindAndModify: false,
    })
    if (req.body.updatedName) {
      await facultyModel.findByIdAndUpdate(
        { _id: objId },
        { name: req.body.updatedName },
        {
          useFindAndModify: false,
        }
      )
      await departmentModel.findOneAndUpdate(
        { facultyName: req.body.name },
        { facultyName: req.body.updatedName },
        {
          useFindAndModify: false,
        }
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
const deleteFaculty = async (req, res, next) => {
  try {
    const facultyFound = await facultyModel.findOne({ name: req.body.name })
    if (!facultyFound) {
      return res.json({
        error: 'faculty not found',
        statuscode: errorCodes.facultyNotFound,
      })
    }
    await facultyModel.deleteOne({ name: req.body.name })
    const depts = await departmentModel.find({ facultyName: req.body.name })
    depts.forEach(async (dept) => {
      await departmentModel.findOneAndUpdate(
        { facultyName: req.body.name },
        { facultyName: undefined },
        {
          useFindAndModify: false,
        }
      )
    })

    res.json({ statuscode: statusCodes.success, message: 'success ' })
  } catch (exception) {
    console.log(exception)
    return res.json({
      error: 'Something went wrong',
      statuscode: statusCodes.unknown,
    })
  }
}

const addNewStaffMember = async (req, res, next) => {
  try {
    //Emails should be unique.
    const emailExist = await staffModel.findOne({ email: req.body.email })
    if (emailExist) {
      return res.json({
        error: 'Emails should be unique!',
        statuscode: errorCodes.emailNotUnique,
      })
    }

    //HR can't assign an office location that already has full capacity.
    const getLocationInfo = await locationModel.findOne({
      location: req.body.locationName,
    })
    if (!getLocationInfo) {
      return res.json({
        error: 'location not found',
        statuscode: errorCodes.locationNotFound,
      })
    }
    const capacity = getLocationInfo.capacity //get the capacity of the location
    const staffInLocation = await staffModel.find({
      locationName: req.body.locationName,
    })
    if (staffInLocation.length >= capacity) {
      return res.json({
        error: 'full office capacity',
        statuscode: errorCodes.fullCapacity,
      })
    }

    //Department of the staff
    const departmentName = req.body.departmentName
    const departmentExist = await departmentModel.findOne({
      name: departmentName,
    })
    if (!departmentExist) {
      return res.json({
        error: 'department does not exist',
      })
    }

    await staffModel.create(req.body)

    //Default password : 123456
    await staffModel.findOneAndUpdate(
      { email: req.body.email },
      { password: '123456' },
      {
        useFindAndModify: false,
      }
    )
    const defPass = await staffModel.findOne({ email: req.body.email })
    const saltKey = bcrypt.genSaltSync(salt)
    defPass.password = bcrypt.hashSync(defPass.password, saltKey)
    await staffModel.findOneAndUpdate(
      { email: req.body.email },
      { password: defPass.password },
      {
        useFindAndModify: false,
      }
    )

    //IDs
    if (req.body.role === 'AcademicMember') {
      const counterAC = await counterModel.findOne({ name: 'ac' })
      if (!counterAC) {
        await counterModel.create({ name: 'ac', counter: 0 })
        const staffs = await staffModel.find({ role: 'AcademicMember' })
        await counterModel.findOneAndUpdate(
          { name: 'ac' },
          { counter: staffs.length },
          {
            useFindAndModify: false,
          }
        )
      }
      const acCounter = await counterModel.findOne({ name: 'ac' })
      const finalCountAC = acCounter.counter
      await staffModel.findOneAndUpdate(
        { email: req.body.email },
        { id: 'ac-' + finalCountAC },
        {
          useFindAndModify: false,
        }
      )
      await counterModel.findOneAndUpdate(
        { name: 'ac' },
        { counter: finalCountAC + 1 },
        {
          useFindAndModify: false,
        }
      )
      //bahoto f staff array el f department
      const depArray = departmentExist.staff
      const elstaff = await staffModel.findOne({ email: req.body.email })
      const elId = elstaff.id
      depArray.push(elId)
      await departmentModel.findOneAndUpdate(
        { name: departmentName },
        { staff: depArray },
        { useFindAndModify: false }
      )

      return res.json({ statuscode: statusCodes.success, message: 'success' })
    } else if (req.body.role === 'HR') {
      const counterHR = await counterModel.findOne({ name: 'hr' })
      if (!counterHR) {
        await counterModel.create({ name: 'hr', counter: 0 })
        const staffs = await staffModel.find({ role: 'HR' })
        await counterModel.findOneAndUpdate(
          { name: 'hr' },
          { counter: staffs.length },
          {
            useFindAndModify: false,
          }
        )
      }
      const hrCounter = await counterModel.findOne({ name: 'hr' })
      const finalCountHR = hrCounter.counter
      await staffModel.findOneAndUpdate(
        { email: req.body.email },
        { id: 'hr-' + finalCountHR, dayoff: 'Saturday' },
        {
          useFindAndModify: false,
        }
      )
      await counterModel.findOneAndUpdate(
        { name: 'hr' },
        { counter: finalCountHR + 1 },
        {
          useFindAndModify: false,
        }
      )
      if (departmentName !== null) {
        return res.json({ error: 'hr does not have department' })
      }
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

const updateStaffMember = async (req, res, next) => {
  try {
    const idFound = await staffModel.findOne({ id: req.body.id })
    const oldDepartment = idFound.departmentName
    if (!idFound) {
      return res.json({
        error: 'staff not found',
        statuscode: errorCodes.staffNotFound,
      })
    }
    if (idFound.role === 'HR' && req.body.dayoff) {
      return res.json({
        error: 'dayoff cant be changed ',
        statuscode: errorCodes.dayOffCantBeChanged,
      })
    }

    //Department of the staff
    const departmentName = req.body.departmentName
    const departmentExist = await departmentModel.findOne({
      name: departmentName,
    })
    if (!departmentExist) {
      return res.json({
        error: 'department does not exist',
      })
    }
    const depArray = departmentExist.staff
    const elId = req.body.id
    depArray.push(elId)
    await departmentModel.findOneAndUpdate(
      { name: departmentName },
      { staff: depArray },
      { useFindAndModify: false }
    )
    const oldDep = await departmentModel.findOne({ name: oldDepartment })
    const staffinOldDep = oldDep.staff
    const indxOfStaff = staffinOldDep.indexOf(req.body.id)
    staffinOldDep.splice(indxOfStaff, 1)
    await departmentModel.findOneAndUpdate(
      { name: oldDepartment },
      { staff: staffinOldDep },
      { useFindAndModify: false }
    )

    const objId = idFound._id
    await staffModel.findByIdAndUpdate({ _id: objId }, req.body, {
      useFindAndModify: false,
    })

    // await staffModel.findByIdAndUpdate({id:req.body.id},{name:req.body.name})
    res.json({ statuscode: statusCodes.success, message: 'success' })
  } catch (exception) {
    return res.json({
      error: 'Something went wrong',
      statuscode: statusCodes.unknown,
    })
  }
}

const deleteStaffMember = async (req, res, next) => {
  try {
    const staffFound = await staffModel.findOne({ id: req.body.id })
    if (!staffFound) {
      return res.json({
        error: 'staff not found',
        statuscode: errorCodes.staffNotFound,
      })
    }
    const depOfStaff = staffFound.departmentName

    await staffModel.deleteOne({ id: req.body.id })
    await scheduleModel.deleteMany({ staffId: req.body.id })
    //await requestModel.deleteOne({staffId:req.body.id})
    await requestSlotLinkingModel.deleteMany({ staffId: req.body.id })
    await assignmentModel.deleteMany({ staff_id: req.body.id })
    await attendanceModel.deleteMany({ staffId: req.body.id })
    await notificationModel.deleteMany({ senderId: req.body.id })
    await notificationModel.deleteMany({ replacerId: req.body.id })
    //Delete staff from array of staff in courses table
    const courses = await coursesModel.find()
    courses.forEach(async (course) => {
      const staffArray = course.staffId
      if (staffArray) {
        const courseId = course._id
        const index = staffArray.indexOf(req.body.id)
        if (index >= 0) {
          staffArray.splice(index, 1)
        }
        await coursesModel.findOneAndUpdate(
          { _id: courseId },
          { staffId: staffArray },
          {
            useFindAndModify: false,
          }
        )
      }
    })
    //Delete staff from array of staff in department table
    const oldDep = await departmentModel.findOne({ name: depOfStaff })
    const staffinDep = oldDep.staff
    const indxOfStaff = staffinDep.indexOf(req.body.id)
    staffinDep.splice(indxOfStaff, 1)
    await departmentModel.findOneAndUpdate(
      { name: depOfStaff },
      { staff: staffinDep },
      { useFindAndModify: false }
    )
    //Delete staff from array of staff in Notification table
    // const notifications= await notificationModel.find()
    // notifications.forEach(async (notification)=>{
    //   const staffArray=notification.staffId
    //   const notifId = notification._id
    //   const index = staffArray.indexOf(req.body.id)
    //   if(index>=0){
    //     staffArray.splice(index,1)
    //   }
    //   await notificationModel.findOneAndUpdate({_id:notifId},{staffId:staffArray},{
    //     useFindAndModify: false,
    //   })
    // })
    res.json({ statuscode: statusCodes.success, message: 'success' })
  } catch (exception) {
    return res.json({
      error: 'Something went wrong',
      statuscode: statusCodes.unknown,
    })
  }
}

const addCourse = async (req, res, next) => {
  try {
    const name = req.body.name
    const code = req.body.code
    const creditHours = req.body.creditHours

    const courseFound = await coursesModel.findOne({ code: code })
    var mess = ''
    if (!courseFound) {
      const newcourse = {}
      newcourse.code = code
      newcourse.name = name
      newcourse.creditHours = creditHours
      await coursesModel.create(newcourse)
      console.log('course added to courses')
      mess = ' course has been added to The all courses in uni In addition to '
    }

    const departmentName = req.body.departmentName

    var departmentFound = await departmentModel.findOne({
      name: departmentName,
    })

    if (departmentFound) {
      var flag = false
      for (i = 0; i < departmentFound.courses.length; i++) {
        if (departmentFound.courses[i] == code) {
          flag = true
        }
      }

      if (flag == false) {
        var newCoursesArray = departmentFound.courses

        // var temp = { name: name, code: code, creditHours: creditHours }
        newCoursesArray.push(code)

        await departmentModel.update(
          {
            name: departmentName,
          },
          {
            courses: newCoursesArray,
          }
        )

        mess += 'Courses added to the department'

        res.json({ statuscode: statusCodes.success, message: mess })
      } else {
        res.json({
          error: 'Course already in the department!',
        })
      }
    } else {
      return res.json({
        error: 'Department DoesNot Exist',
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

const deleteCourse = async (req, res, next) => {
  try {
    const code = req.body.code
    const departmentName = req.body.departmentName
    var departmentFound = await departmentModel.findOne({
      name: departmentName,
    })
    var flag = false

    if (!departmentFound) {
      res.json({ error: 'Department DoesNot Exist' })
    }
    const courseFound = await coursesModel.findOne({ code: code })

    if (courseFound) {
      for (i = 0; i < departmentFound.courses.length; i++) {
        if (departmentFound.courses[i] == code) flag = true
      }
      if (flag) {
        var newCoursesArray = departmentFound.courses
        var i = 0
        while (i < newCoursesArray.length) {
          if (newCoursesArray[i] === code) {
            newCoursesArray.splice(i, 1)
          } else {
            ++i
          }
        }

        await departmentModel.update(
          {
            name: departmentName,
          },
          {
            courses: newCoursesArray,
          }
        )

        var Staff_array = departmentFound.staffId
        if (Staff_array) {
          for (i = 0; i < Staff_array.length; i++) {
            var stafssfound = await staffModel.findOne({ id: Staff_array[i] })
            if (stafssfound) {
              var newcoursessFound = stafssfound.courses
              var j = 0
              var flag = false
              if (coursessFound) {
                while (j < coursessFound.length) {
                  if (newcoursessFound[i] == oldcode) {
                    splice(j, 1)
                    flag = true
                  } else {
                    j++
                  }
                }
              }
              if (flag) {
                await staffModel.updateOne(
                  {
                    id: Staff_array[i],
                  },
                  { oldcode: newcoursessFound }
                )
              }
            }
          }
        }

        res.json({ message: 'CourseDelted!' })
      } else {
        res.json({ error: 'Course Is Not in the department!' })
      }
    } else {
      res.json({
        statuscode: statusCodes.success,
        error: 'Course doesnot exist',
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
const updateCourse = async (req, res, next) => {
  try {
    const oldcode = req.body.code
    const departmentName = req.body.departmentName
    const datatobe = {}

    var departmentFound = await departmentModel.findOne({
      name: departmentName,
    })
    if (!departmentFound) {
      res.json({ error: 'Department DoesNot Exist' })
    }
    const courseFound = await coursesModel.findOne({ code: oldcode })
    if (!courseFound) {
      res.json({ error: 'Course DoesNot Exist' })
    }

    datatobe.code = oldcode

    if (req.body.name) {
      datatobe.name = req.body.name
    }

    if (req.body.creditHours) {
      datatobe.creditHours = req.body.creditHours
    }

    if (req.body.newCode) {
      datatobe.code = req.body.newCode

      var newCoursesArray = departmentFound.courses
      var i = 0
      var flag = false

      while (i < newCoursesArray.length) {
        if (newCoursesArray[i] === oldcode) {
          flag = true
          newCoursesArray[i] = req.body.newCode
        }
        ++i
      }
      if (!flag) {
        res.json({ error: 'Course NotFound in Department' })
      }

      await departmentModel.updateOne(
        {
          name: departmentName,
        },
        { courses: newCoursesArray }
      )

      var Staff_array = departmentFound.staffId
      if (Staff_array) {
        for (i = 0; i < Staff_array.length; i++) {
          var stafssfound = await staffModel.findOne({ id: Staff_array[i] })
          var newcoursessFound = stafssfound.courses
          var j = 0
          var flag = false
          while (j < coursessFound.length) {
            if (newcoursessFound == oldcode) {
              splice(j, 1)
              flag = true
            } else {
              j++
            }

            if (flag) {
              await staffModel.updateOne(
                {
                  id: Staff_array[i],
                },
                { oldcode: newcoursessFound }
              )
            }
          }
        }
      }
    }
    await coursesModel.updateOne(
      {
        code: oldcode,
      },
      datatobe
    )

    res.json({ statuscode: statusCodes.success, message: 'CourseUpdated!' })
  } catch (exception) {
    //console.log(exception)
    return res.json({
      error: 'Something went wrong',
      statuscode: statusCodes.unknown,
    })
  }
}

const viewStaffMembersWithMissingDays = async (req, res) => {
  try {
    const allStaff = await staffModel.find()

    const staffList = []
    //hat mel shahr el fat le delwa2ty
    for (var n = 0; n < allStaff.length; n++) {
      //console.log('here')
      const dataToReturn = []
      const date = new Date()
      const user = allStaff[n]
      const dayOff = user.dayoff
      if (date.getDate() < 11) {
        //test for 7owar previous month for jan
        //console.log('inside the if')
        date.setMonth(date.getUTCMonth() - 1)
        date.setDate(11)

        const startDate = new Date(2020, 11, 1)
        const testingDate = new Date()

        const dateDiff =
          (testingDate.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)

        const AlldaysArray = []
        const allRecordsPrevoiusMonth = await attendanceModel.find(
          {
            staffId: user.id,
            day: { $gte: 11 },
            month: date.getUTCMonth() + 1,
          },
          [],
          { sort: { day: 1 } }
        )
        const allRecordsThisMonth = await attendanceModel.find(
          {
            staffId: user.id,
            day: { $lte: new Date().getUTCDate() },
            month: new Date().getUTCMonth() + 1,
          },
          [],
          { sort: { day: 1 } }
        )
        for (var k = 0; k < allRecordsThisMonth.length; k++) {
          AlldaysArray.push(allRecordsThisMonth[k].day)
        }
        for (var l = 0; l < allRecordsPrevoiusMonth.length; l++) {
          AlldaysArray.push(allRecordsPrevoiusMonth[l].day)
        }
        for (var i = 12; i < dateDiff + 13; i++) {
          const Date1 = new Date(date.getUTCFullYear(), date.getUTCMonth(), i)

          if (days[Date1.getUTCDay()] == 'Friday') {
            continue
          }

          if (days[Date1.getUTCDay()] !== dayOff) {
            const index = AlldaysArray.indexOf(Date1.getUTCDate())
            if (index < 0) {
              dataToReturn.push({
                date: Date1,
              })
            }
          }
        }
        if (dataToReturn.length != 0) {
          staffList.push({ staffId: user.id, missingDates: dataToReturn })
        }
      } else {
        // console.log('inside else')
        const AlldaysArray = []
        const allRecords = await attendanceModel.find(
          {
            staffId: user.id,
            day: { $lte: date.getUTCDate(), $gte: 11 },
            month: date.getUTCMonth() + 1,
          },
          [],
          { sort: { day: 1 } }
        )
        //console.log(allRecords)
        for (var k = 0; k < allRecords.length; k++) {
          AlldaysArray.push(allRecords[k].day)
        }
        //  break
        //console.log('alldaysarray', AlldaysArray)

        for (var i = 12; i <= date.getDate() + 1; i++) {
          // console.log('inside the loop')
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
            // console.log(tempDate.getUTCDate())
            const index = AlldaysArray.indexOf(tempDate.getUTCDate())
            if (index < 0) {
              dataToReturn.push({
                date: tempDate,
              })
            }
          }
        }
        if (dataToReturn.length != 0) {
          staffList.push({ staffId: user.id, missingDates: dataToReturn })
        }
        // console.log('outside the loop')
      }
      //console.log('outside the loop2')
    }
    return res.json({
      statuscode: statusCodes.success,

      staff: staffList,
    })
  } catch (exception) {
    console.log(exception)
    return res.json({
      error: 'Something went wrong',
      statuscode: statusCodes.unknown,
    })
  }
}

const viewStaffMembersWithMissingHours = async (req, res, next) => {
  try {
    const allStaff = await staffModel.find({})

    var staffToReturn = []
    for (var i = 0; i < allStaff.length; i++) {
      const user = allStaff[i]
      // console.log(user)
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
          if (!hours) {
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
          if (!hours) {
            hours = 0
            minutes = 0
          }
          diff = diff + minutesInDay - minutes
        })
        // console.log(diff)
      } else {
        const attendanceRecordsThisMonth = await attendanceModel.find({
          staffId: user.id,
          day: { $lte: date.getUTCDate() },
          month: date.getUTCMonth() + 1,
          status: 'attended',
        })

        attendanceRecordsThisMonth.forEach((attendanceRecord) => {
          let hours = attendanceRecord.totalHours
          let minutes = attendanceRecord.totalMinutes + hours * 60
          if (!hours && !minutes) {
            hours = 0
            minutes = 0
          }
          diff = diff + minutesInDay - minutes
        })
      }

      if (diff > 0) {
        diff = diff / 60
        diff = Math.round(diff * 100) / 100
        staffToReturn.push({ staffId: user.id })
      }
    }
    return res.json({
      statuscode: statusCodes.success,
      message: 'success',
      staffWithMissingHours: staffToReturn,
    })
  } catch (exception) {
    return res.json({
      error: 'Something went wrong',
      statuscode: statusCodes.unknown,
    })
  }
}
const viewStaffAttendance = async (req, res, next) => {
  try {
    const user = req.body
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
        const allRecordsThisMonth = await attendanceModel.find(
          {
            staffId: user.id,
            day: { $lte: new Date().getUTCDate() },
            month: new Date().getUTCMonth() + 1,
          },
          [],
          { sort: { day: 1 } }
        )
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
    return res.json({
      error: 'Something went wrong',
      statuscode: statusCodes.unknown,
    })
  }
}

const addMissingSignIn = async (req, res, next) => {
  try {
    const date = new Date(req.body.date)
    const staffId = req.body.staffId
    const signInHour = req.body.signInHour
    const signInMinute = req.body.signInMinute
    if (staffId == req.data.id) {
      return res.json({
        error: 'you cannot add a record for yourself',
        statuscode: youCannotAddSignInOutToYourself,
      })
    }
    const userFound = await staffModel.findOne({ id: staffId })
    if (!userFound) {
      return res.json({
        error: 'please use a valid user',
        statuscode: staffNotFound,
      })
    }
    const recordFound = await attendanceModel.findOne({
      staffId,
      day: date.getUTCDate(),
      month: date.getUTCMonth() + 1,
    })
    if (recordFound) {
      await attendanceModel.update(
        { staffId, month: date.getUTCMonth() + 1, day: date.getUTCDate() },
        { startHour: signInHour, startMinute: signInMinute }
      )
    } else {
      await attendanceModel.create({
        status: 'attended',
        month: date.getUTCMonth() + 1,
        day: date.getUTCDate(),
        startHour: signInHour,
        startMinute: signInMinute,
        totalHours: 0,
        totalMinutes: 0,
        staffId,
      })
    }
    return res.json({ message: 'success', statuscode: statusCodes.success })
  } catch (exception) {
    console.log(exception)
    return res.json({
      error: 'Something went wrong',
      statuscode: statusCodes.unknown,
    })
  }
}
const addMissingSignOut = async (req, res, next) => {
  try {
    const date = new Date(req.body.date)

    const staffId = req.body.staffId
    const signOutHour = req.body.signOutHour
    const signOutMinute = req.body.signOutMinute

    if (staffId == req.data.id) {
      return res.json({
        error: 'you cannot add a record for yourself',
        statuscode: youCannotAddSignInOutToYourself,
      })
    }
    const userFound = await staffModel.findOne({ id: staffId })
    if (!userFound) {
      return res.json({
        error: 'please use a valid user',
        statuscode: staffNotFound,
      })
    }
    const recordFound = await attendanceModel.findOne({
      staffId,
      day: date.getUTCDate(),
      month: date.getUTCMonth() + 1,
    })

    if (recordFound) {
      const timeStarting = recordFound.startHour * 60 + recordFound.startMinute
      const timeEnding = signOutHour * 60 + signOutMinute
      if (timeStarting > timeEnding) {
        return res.json({
          error: 'sign out time Cannot be before signIn',
          statuscode: SignInLaterThanSignUp,
        })
      }
      const hoursOfDay = Math.floor((timeEnding - timeStarting) / 60)
      const minutes = (timeEnding - timeStarting) % 60
      await attendanceModel.update(
        { _id: recordFound._id },
        {
          totalHours: hoursOfDay + recordFound.totalHours,
          totalMinutes: minutes + recordFound.totalMinutes,
          endHour: signOutHour,
          endMinute: signOutMinute,
        }
      )
      return res.json({ message: 'success', statuscode: statusCodes.success })
    } else {
      return res.json({
        error:
          'you are trying to manually create a signOut, without having a signIn for that day, to proceed, manually insert a signIn record first',
        statuscode: noCoresspondingSignOut,
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

module.exports = {
  addLocation,
  addFaculty,
  addDepartment,
  deleteDepartment,
  deleteLocation,
  updateLocation,
  updateStaffSalary,
  updateDepartment,
  addCourse,
  deleteCourse,
  updateCourse,
  deleteFaculty,
  addNewStaffMember,
  updateStaffMember,
  deleteStaffMember,
  updateFaculty,
  viewStaffMembersWithMissingHours,
  viewStaffMembersWithMissingDays,
  viewStaffAttendance,
  addMissingSignIn,
  addMissingSignOut,
}
