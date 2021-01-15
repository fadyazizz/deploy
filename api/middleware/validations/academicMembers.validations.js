const BaseJoi = require('joi')
const ImageExtension = require('joi-image-extension')
const Joi = BaseJoi.extend(ImageExtension)
const statusCodes = require('../../constants/statusCodes')
const validateSendReplacementNotification = (req, res, next) => {
  const schema = Joi.object({
    replacerId: Joi.string().required(),
    date: Joi.date().required(),

    slot: Joi.number().min(1).max(5).required(),
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
const validateAnnualLeaveRequest = (req, res, next) => {
  const schema = Joi.object({
    date: Joi.date().required(),
    reason: Joi.string(),
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
const validateAcceptReplacementRequest = (req, res, next) => {
  const schema = Joi.object({
    requestId: Joi.string().required().length(24),
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
const validateRejectReplacementRequest = (req, res, next) => {
  const schema = Joi.object({
    requestId: Joi.string().required().length(24),
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

const validateViewReplacementRequest = (req, res, next) => {
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
const validateSendCompensationLeave = (req, res, next) => {
  const schema = Joi.object({
    date: Joi.date().required(),
    reason: Joi.string().required(),
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
const validateSendSickLeave = (req, res, next) => {
  const schema = Joi.object({
    dateOfSickness: Joi.date().required(),
    reason: Joi.string(),
    uploadId: Joi.string().required().length(24),
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
const validateSendMaternityLeave = (req, res, next) => {
  const schema = Joi.object({
    startDate: Joi.date().required(),
    reason: Joi.string(),
    uploadId: Joi.string().required().length(24),
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
const validateSendaccidentalLeave = (req, res, next) => {
  const schema = Joi.object({
    date: Joi.date().required(),
    reason: Joi.string(),
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
const validateUploadDocument = (req, res, next) => {
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
const validateSendChangeDayOff = (req, res, next) => {
  const schema = Joi.object({
    newDay: Joi.string()
      .valid(
        'Sunday',
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday'
      )
      .required(),
    reason: Joi.string(),
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

const validatedeleteSlotLinkingRequests = (req, res, next) => {
  const schema = Joi.object({
    requestId: Joi.string().required().length(24),
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
const validateSendSlotLinkingRequest = (req, res, next) => {
  const schema = Joi.object({
    courseCode: Joi.string().required(),
   
    staffId: Joi.string().required(), 
 
    location: Joi.string().required(),
//from array to string
    desiredSlotName: Joi.number().required().valid(1, 2, 3, 4, 5),

    desiredSlotday: Joi.string()
      .required()
      .valid(
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Saturday',
        'Sunday'
      ),
    desiredSlotType: Joi.string()
      .required()
      .valid('lab', 'tutorial', 'lecture'),
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

const validateviewSlotLinkingStatus = (req, res, next) => {
  const schema = Joi.object({
    requestStatus: Joi.string().valid('pending', 'accepted', 'rejected'),
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

const validateViewSchedule = (req, res, next) => {
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

const validateViewcourseslot = (req, res, next) => {
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

const validateViewRequestsStatus = (req, res, next) => {
  const schema = Joi.object({
    status: Joi.string().valid('pending', 'accepted', 'rejected'),
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
const validateCancelRequest = (req, res, next) => {
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
const validateNotifyAcceptRejectRequest = (req, res, next) => {
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
module.exports = {
  validateSendReplacementNotification,
  validateAnnualLeaveRequest,
  validateAcceptReplacementRequest,
  validateRejectReplacementRequest,
  validateViewReplacementRequest,
  validateSendCompensationLeave,
  validateSendSickLeave,
  validateUploadDocument,
  validateSendMaternityLeave,
  validateSendaccidentalLeave,
  validateSendChangeDayOff,
  validateSendSlotLinkingRequest,
  validateViewSchedule,
  validatedeleteSlotLinkingRequests,
  validateviewSlotLinkingStatus,
  validateViewRequestsStatus,
  validateCancelRequest,
  validateNotifyAcceptRejectRequest,
  validateViewcourseslot
}
