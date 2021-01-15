const Joi = require('joi')
const statusCodes = require('../../constants/statusCodes')

const validateViewSlotLinkingRequest = (req, res, next) => {
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


const validateacceptSlotLinkingRequests  = (req, res, next) => {
  const schema = Joi.object({
    requestId:Joi.string().required().length(24)


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


const validateRejectSlotLinkingRequests  = (req, res, next) => {
  const schema = Joi.object({
    requestId:Joi.string().required().length(24)


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

const validateAddCourseSlot = (req, res, next) => {
  const schema = Joi.object({
    slotName: Joi.number().integer().valid(1, 2, 3, 4, 5).required(),
    day: Joi.string()
      .valid('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Saturday', 'Sunday')
      .required(),
    typeOfSlot: Joi.string().valid('lab', 'tutorial', 'lecture').required(),
    location: Joi.string().required(),
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
const validateDeleteCourseSlot = (req, res, next) => {
  const schema = Joi.object({
    slotName: Joi.number().integer().valid(1, 2, 3, 4, 5).required(),
    day: Joi.string()
      .valid('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Saturday', 'Sunday')
      .required(),
    typeOfSlot: Joi.string().valid('lab', 'tutorial', 'lecture'),
    location: Joi.string().required(),
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
const validateUpdateCourseSlot = (req, res, next) => {
  const schema = Joi.object({
    slotName: Joi.number().valid(1, 2, 3, 4, 5).required(),
    day: Joi.string()
      .valid('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Saturday', 'Sunday')
      .required(),
    location: Joi.string().required(),
    courseCode: Joi.string().required(),
    typeOfSlot: Joi.string().valid('lab', 'tutorial', 'lecture'),
    updatedDay: Joi.string().valid(
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Saturday',
      'Sunday'
    ),
    updatedSlotName: Joi.number().valid(1, 2, 3, 4, 5),
    updatedLocation: Joi.string(),
    updatedCourseCode: Joi.string(),
    updatedTypeOfSlot: Joi.string().valid('lab', 'tutorial', 'lecture'),
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
  validateAddCourseSlot,
  validateDeleteCourseSlot,
  validateUpdateCourseSlot,
  validateViewSlotLinkingRequest,
  validateRejectSlotLinkingRequests ,
  validateacceptSlotLinkingRequests
}
