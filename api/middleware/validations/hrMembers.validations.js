const Joi = require('joi')
const facultyModel = require('../../../models/faculty')
const staffModel = require('../../../models/staff')
const { NOTaValidFaculty, HODStaffIDInvalid } = require('../../errorCodes')
const statusCodes = require('../../constants/statusCodes')

const validateAddLocation = (req, res, next) => {
  const schema = Joi.object({
    location: Joi.string().required(),
    capacity: Joi.number().required(),
    typeOfLocation: Joi.string()
      .valid('office', 'lab', 'tutorial', 'lectureHall')
      .required(),
  })
  const isValid = Joi.validate(req.body, schema)

  if (isValid.error) {
    return res.json({
      statuscode: statusCodes.validation,
      error: isValid.error.details[0].message,
    })
  }
  return next()
}
const validateUpdateStaffSalary = (req, res, next) => {
  const schema = Joi.object({
    id: Joi.string().required(),

    UpdatedSalary: Joi.number().required(),
  })
  const isValid = Joi.validate(req.body, schema)

  if (isValid.error) {
    return res.json({
      statuscode: statusCodes.validation,
      error: isValid.error.details[0].message,
    })
  }
  return next()
}

const validateUpdateLocation = (req, res, next) => {
  const schema = Joi.object({
    location: Joi.string().required(),
    updatedLocationName: Joi.string(),
    capacity: Joi.number(),
    typeOfLocation: Joi.string().valid(
      'office',
      'lab',
      'tutorial',
      'lectureHall'
    ),
  })
  const isValid = Joi.validate(req.body, schema)

  if (isValid.error) {
    return res.json({
      statuscode: statusCodes.validation,
      error: isValid.error.details[0].message,
    })
  }
  return next()
}

const validateAddDepartment = (req, res, next) => {
  const schema = Joi.object({
    name: Joi.string().required(),
    facultyName: Joi.string().required(),
    headOfDepartmentId: Joi.string().required(),
    staff: Joi.array(),
  })
  const isValid = Joi.validate(req.body, schema)

  if (isValid.error) {
    return res.json({
      statuscode: statusCodes.validation,
      error: isValid.error.details[0].message,
    })
  }
  return next()
}

const validateUpdateDepartment = (req, res, next) => {
  const schema = Joi.object({
    name: Joi.string().required(),
    UpdateddepName: Joi.string(),
    facultyName: Joi.string(),
    headOfDepartmentId: Joi.string(),
    staff: Joi.array(),
  })
  const isValid = Joi.validate(req.body, schema)

  if (isValid.error) {
    return res.json({
      statuscode: statusCodes.validation,
      error: isValid.error.details[0].message,
    })
  }
  return next()
}

const validatedeleteDepartment = (req, res, next) => {
  const schema = Joi.object({
    name: Joi.string().required(),
  })
  const isValid = Joi.validate(req.body, schema)

  if (isValid.error) {
    return res.json({
      statuscode: statusCodes.validation,
      error: isValid.error.details[0].message,
    })
  }
  return next()
}
const validateViewStaffMembersWithMissingHours = (req, res, next) => {
  const schema = Joi.object({})
  const isValid = Joi.validate(req.body, schema)

  if (isValid.error) {
    return res.json({
      statuscode: statusCodes.validation,
      error: isValid.error.details[0].message,
    })
  }
  return next()
}

const validatedeleteLocation = (req, res, next) => {
  const schema = Joi.object({
    locationname: Joi.string().required(),
  })
  const isValid = Joi.validate(req.body, schema)

  if (isValid.error) {
    return res.json({
      statuscode: statusCodes.validation,
      error: isValid.error.details[0].message,
    })
  }
  return next()
}

const validateAddFaculty = (req, res, next) => {
  const schema = Joi.object({
    name: Joi.string().required(),
  })
  const isValid = Joi.validate(req.body, schema)

  if (isValid.error) {
    return res.json({
      statuscode: statusCodes.validation,
      error: isValid.error.details[0].message,
    })
  }
  return next()
}

const validateAddCourse = (req, res, next) => {
  const schema = Joi.object({
    name: Joi.string().required(),
    code: Joi.string().required(),
    creditHours: Joi.number().required(),
    departmentName: Joi.string().required(),
  })
  const isValid = Joi.validate(req.body, schema)

  if (isValid.error) {
    return res.json({
      statuscode: statusCodes.validation,
      error: isValid.error.details[0].message,
    })
  }
  return next()
}

const validateDeleteCourse = (req, res, next) => {
  const schema = Joi.object({
    code: Joi.string().required(),
    departmentName: Joi.string().required(),
  })
  const isValid = Joi.validate(req.body, schema)

  if (isValid.error) {
    return res.json({
      statuscode: statusCodes.validation,
      error: isValid.error.details[0].message,
    })
  }
  return next()
}

const validateUpdateCourse = (req, res, next) => {
  const schema = Joi.object({
    code: Joi.string().required(),
    name: Joi.string(),
    creditHours: Joi.number(),
    departmentName: Joi.string().required(),
    newCode: Joi.string(),
  })
  const isValid = Joi.validate(req.body, schema)

  if (isValid.error) {
    return res.json({
      statuscode: statusCodes.validation,
      error: isValid.error.details[0].message,
    })
  }
  return next()
}

const validateDeleteFaculty = (req, res, next) => {
  const schema = Joi.object({
    name: Joi.string().required(),
  })
  const isValid = Joi.validate(req.body, schema)

  if (isValid.error) {
    return res.json({
      statuscode: statusCodes.validation,
      error: isValid.error.details[0].message,
    })
  }
  return next()
}

const validateUpdateFaculty = (req, res, next) => {
  const schema = Joi.object({
    name: Joi.string().required(),
    updatedName: Joi.string(),
    infoAboutFaculty: Joi.string(),
  })
  const isValid = Joi.validate(req.body, schema)

  if (isValid.error) {
    return res.json({
      statuscode: statusCodes.validation,
      error: isValid.error.details[0].message,
    })
  }
  return next()
}

const validateAddNewStaffMember = (req, res, next) => {
  const schema = Joi.object({
    // id:Joi.string().required(),
    name: Joi.string().required(),
    gender: Joi.string().required(),
    email: Joi.string().required(),
    salary: Joi.number().required(),
    locationName: Joi.string().required(),
    role: Joi.string().valid('AcademicMember', 'HR').required(),
    roleOfAcademicMember: Joi.string(),
    dayoff: Joi.string().valid(
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Saturday',
      'Sunday'
    ),
    departmentName: Joi.string(),
  })
  const isValid = Joi.validate(req.body, schema)

  if (isValid.error) {
    return res.json({
      statuscode: statusCodes.validation,
      error: isValid.error.details[0].message,
    })
  }
  return next()
}

const validateUpdateStaffMember = (req, res, next) => {
  const schema = Joi.object({
    id: Joi.string().required(),
    name: Joi.string(),
    salary: Joi.number(),
    email: Joi.string(),
    dayoff: Joi.string().valid(
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Saturday',
      'Sunday'
    ),
    departmentName: Joi.string(),
  })
  const isValid = Joi.validate(req.body, schema)

  if (isValid.error) {
    return res.json({
      statuscode: statusCodes.validation,
      error: isValid.error.details[0].message,
    })
  }
  return next()
}

const validateDeleteStaffMember = (req, res, next) => {
  const schema = Joi.object({
    id: Joi.string().required(),
  })
  const isValid = Joi.validate(req.body, schema)

  if (isValid.error) {
    return res.json({
      statuscode: statusCodes.validation,
      error: isValid.error.details[0].message,
    })
  }
  return next()
}
const validateViewStaffMembersWithMissingDays = (req, res, next) => {
  const schema = Joi.object({})
  const isValid = Joi.validate(req.body, schema)

  if (isValid.error) {
    return res.json({
      statuscode: statusCodes.validation,
      error: isValid.error.details[0].message,
    })
  }
  return next()
}

const validateViewStaffAttendance = (req, res, next) => {
  const schema = Joi.object({
    id: Joi.string().required(),
    month: Joi.number().min(1).max(12),
  })
  const isValid = Joi.validate(req.body, schema)

  if (isValid.error) {
    return res.json({
      statuscode: statusCodes.validation,
      error: isValid.error.details[0].message,
    })
  }
  return next()
}

/*const date = new Date(req.body.date)

    const staffId = req.body.staffId
    const signOutHour = req.body.signOutHour
    const signOutMinute = req.body.signOutMinute

    const totalHours = req.body.totalHours
    const totalMinutes = req.body.totalMinutes*/

const validateAddMissingSignOut = (req, res, next) => {
  const schema = Joi.object({
    date: Joi.date().required(),
    staffId: Joi.string().required(),
    signOutHour: Joi.number().required().min(7).max(19),
    signOutMinute: Joi.number().required().min(1).max(59),
  })
  const isValid = Joi.validate(req.body, schema)

  if (isValid.error) {
    return res.json({
      statuscode: statusCodes.validation,
      error: isValid.error.details[0].message,
    })
  }
  return next()
}
const validateAddMissingSignIn = (req, res, next) => {
  const schema = Joi.object({
    date: Joi.date().required(),
    staffId: Joi.string().required(),
    signInHour: Joi.number().required().min(7).max(23),
    signInMinute: Joi.number().required().min(1).max(59),
  })
  const isValid = Joi.validate(req.body, schema)

  if (isValid.error) {
    return res.json({
      statuscode: statusCodes.validation,
      error: isValid.error.details[0].message,
    })
  }
  return next()
}

module.exports = {
  validateUpdateDepartment,
  validateAddLocation,

  validateAddDepartment,
  validatedeleteDepartment,
  validatedeleteLocation,
  validateUpdateLocation,
  validateUpdateStaffSalary,
  validateAddLocation,
  validateAddCourse,
  validateDeleteCourse,
  validateUpdateCourse,
  validateAddLocation,
  validateAddFaculty,
  validateDeleteFaculty,
  validateAddNewStaffMember,
  validateUpdateStaffMember,
  validateDeleteStaffMember,
  validateUpdateFaculty,
  validateViewStaffMembersWithMissingHours,
  validateViewStaffMembersWithMissingDays,
  validateViewStaffAttendance,
  validateAddMissingSignIn,
  validateAddMissingSignOut,
}
