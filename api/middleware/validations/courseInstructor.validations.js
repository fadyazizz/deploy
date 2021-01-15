const Joi = require('joi')
const statusCodes = require('../../constants/statusCodes')

const validateViewCourseCoverageCI = (req, res, next) => {
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
const viewUnassignedSlotValidation = (req,res,next)=>{
  const schema = Joi.object({
    
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
const validateAssignAcademicMemberToSlot = (req, res, next) => {
  const schema = Joi.object({
    staffId: Joi.string().required(),
    typeOfSlot: Joi.string().valid('lab', 'tutorial', 'lecture').required(),
    courseCode: Joi.string().required(),
    location: Joi.string().required(),
    day: Joi.string()
      .valid('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Saturday', 'Sunday')
      .required(),
    slotName: Joi.number().valid(1, 2, 3, 4, 5).required(),
    //timing: Joi.string().required(),
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
const validateUpateAssignment = (req, res, next) => {
  const schema = Joi.object({
    staffId: Joi.string().required(),
    typeOfSlot: Joi.string().valid('lab', 'tutorial', 'lecture').required(),
    location: Joi.string().required(),
    day: Joi.string()
      .valid('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Saturday', 'Sunday')
      .required(),
    slotName: Joi.number().valid(1, 2, 3, 4, 5).required(),
    //timing: Joi.string().required(),
    courseCode: Joi.string().required(),
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
const validateDeleteAssignment = (req, res, next) => {
  const schema = Joi.object({
    staffId: Joi.string().required(),
    typeOfSlot: Joi.string().valid('lab', 'tutorial', 'lecture').required(),
    courseCode: Joi.string().required(),
    location: Joi.string().required(),
    day: Joi.string()
      .valid('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Saturday', 'Sunday')
      .required(),
    slotName: Joi.number().valid(1, 2, 3, 4, 5).required(),
    // timing: Joi.string().required(),
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

const validateDeleteCourseAssignment = (req, res, next) => {
  const schema = Joi.object({
    staffId: Joi.string().required(),
    courseCode: Joi.string().required(),
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
const validateviewSlotsAssignment = (req, res, next) => {
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

const validateviewStaffInMyDepartment = (req, res, next) => {
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

const validateviewStaffInMyCourses = (req, res, next) => {
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
const validateViewStaffPerCourse = (req, res, next) => {
  const schema = Joi.object({
    courseCode: Joi.string().required(),
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
const validateRemoveAcademicMember = (req, res, next) => {
  const schema = Joi.object({
    academicMemberId: Joi.string().required(),
    courseCode: Joi.string().required(),
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
const ValidateAssignmentAcademicToCourse = (req, res, next) => {
  const schema = Joi.object({
    staffId: Joi.string().required(),
    courseCode: Joi.string().required(),
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

const validateassignAcademicMemberToCourseCoordinator = (req, res, next) => {
  const schema = Joi.object({
    academicMemberId: Joi.string().required(),
    courseCode: Joi.string().required(),
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
  validateAssignAcademicMemberToSlot,
  validateUpateAssignment,
  validateDeleteAssignment,
  validateViewCourseCoverageCI,
  validateviewStaffInMyDepartment,
  validateviewStaffInMyCourses,
  validateviewSlotsAssignment,
  validateassignAcademicMemberToCourseCoordinator,
  validateRemoveAcademicMember,
  validateViewStaffPerCourse,
  validateDeleteCourseAssignment,
  ValidateAssignmentAcademicToCourse,
  viewUnassignedSlotValidation,
}
