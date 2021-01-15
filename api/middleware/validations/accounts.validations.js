const Joi = require('joi')

const statusCodes = require('../../constants/statusCodes')
const validateLogIn = (req, res, next) => {
  console.log('validate!!', req.body.email)
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }).required()
  const isValid = Joi.validate(req.body, schema)

  if (isValid.error) {
    return res.json({
      statuscode: statusCodes.validation,
      error: isValid.error.details[0].message,
    })
  }
  return next()
}
const validateLogOut = (req, res, next) => {
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
const validateSignIn = (req, res, next) => {
  // console.log('validate!!')
  const schema = Joi.object({
    startHour: Joi.number().max(23).min(0).required(),
    startMinute: Joi.number().max(60).min(0).required(),
    date: Joi.date().required(),
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

const validateSignOut = (req, res, next) => {
  // console.log('validate!!')
  const schema = Joi.object({
    endHour: Joi.number().max(23).min(0).required(),
    endMinute: Joi.number().max(60).min(0).required(),
    date: Joi.date().required(),
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

const validateViewProfile = (req, res, next) => {
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
const validateViewAttendanceRecords = (req, res, next) => {
  const schema = Joi.object({
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
const validateMissingDays = (req, res, next) => {
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

const validateMissingHours = (req, res, next) => {
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

const validateUpdateProfile = (req, res, next) => {
  const schema = Joi.object({
    email: Joi.string().email(),
    salary: Joi.number(),
    location: Joi.string(),
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
const validateResetPassowrd = (req, res, next) => {
  const schema = Joi.object({
    oldPassword: Joi.string().required(),
    newPassword: Joi.string().required(),
    confirmationNewPassword: Joi.string().required(),
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
  validateLogIn,
  validateViewProfile,
  validateSignIn,
  validateSignOut,
  validateViewAttendanceRecords,
  validateMissingDays,
  validateMissingHours,
  validateLogIn,
  validateViewProfile,
  validateUpdateProfile,
  validateResetPassowrd,
  validateLogOut
}
