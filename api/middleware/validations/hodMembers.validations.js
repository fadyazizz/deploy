const Joi = require('joi')

const statusCodes = require('../../constants/statusCodes')
const validateViewAllRequests = (req, res, next) => {
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

const validateAcceptRequest = (req, res, next) => {
  const schema = Joi.object({ requestId: Joi.string().required().length(24) })
  const isValid = Joi.validate(req.body, schema)

  if (isValid.error) {
    return res.json({
      statuscode: statusCodes.validation,
      error: isValid.error.details[0].message,
    })
  }
  return next()
}

const validateRejectRequest = (req, res, next) => {
  const schema = Joi.object({
    requestId: Joi.string().required().length(24),
    comment: Joi.string(),
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

const validateViewCourseCoverageHOD = (req, res, next) => {
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

const validateViewTeachingassigns = (req, res, next) => {
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
const validateAllViewStaffInMyDepartment = (req, res, next) => {
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

const validateViewAllStaffPerCourse = (req, res, next) => {
  const schema = Joi.object({
    courseId: Joi.string(),
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

const validateStaffIDayOff = (req, res, next) => {
  const schema = Joi.object({
    staff_id: Joi.string(),
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
const validateAssignCourseInstructor = (req, res, next) => {
  const schema = Joi.object({
      courseInstId:Joi.string().required(),
      courseCode:Joi.string().required(),
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
const validateDeleteCourseInstructor = (req, res, next) => {
    const schema = Joi.object({
        courseInstId:Joi.string().required(),
        courseCode:Joi.string().required(),
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
  const validateUpdateCourseInstructor = (req, res, next) => {
    const schema = Joi.object({
        courseInstId:Joi.string().required(),
        courseCode:Joi.string().required(),
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
  validateViewAllRequests,
  validateAcceptRequest,
  validateRejectRequest,
  validateViewCourseCoverageHOD,
  validateViewTeachingassigns,
  validateAllViewStaffInMyDepartment,
  validateStaffIDayOff,
  validateViewAllStaffPerCourse,
  validateAssignCourseInstructor,
  validateDeleteCourseInstructor,
  validateUpdateCourseInstructor,
}
