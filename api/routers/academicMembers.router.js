const express = require('express')
const router = express.Router()
var multer = require('multer')

var storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads')
  },
  filename: (req, file, cb) => {
    cb(null, file.fieldname + '-' + Date.now())
  },
})

var upload = multer({ storage: storage })
const {
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
  validatedeleteSlotLinkingRequests,
  validateviewSlotLinkingStatus,

  validateViewRequestsStatus,
  validateCancelRequest,
  validateNotifyAcceptRejectRequest,
  validateViewcourseslot,
} = require('../middleware/validations/academicMembers.validations')
const {
  sendReplacementNotification,
  sendAnnualLeaveRequest,
  acceptReplacementRequest,
  rejectReplacementRequest,
  viewReplacementRequests,
  sendCompensationLeave,
  sendSickLeave,
  uploadDocument,
  sendMaternityLeave,
  sendAccidentalLeave,
  changeDayOff,
  sendSlotLinkingRequests,
  deleteSlotLinkingRequests,
  viewSlotLinkingStatus,
  viewRequestsStatus,
  cancelRequest,
  notifyAcceptRejectRequest,
  ViewAllMyUploads,
  viewCourseslots,
  removeNotification,
} = require('../controllers/academicMembers.controller')
const { verifyToken, verifyAC } = require('../helpers/accounts.helpers')
router.delete(
  '/deleteSlotLinkingRequests',
  verifyToken,
  verifyAC,
  validatedeleteSlotLinkingRequests,
  deleteSlotLinkingRequests
)
router.post(
  '/sendReplacementNotification',
  verifyToken,
  verifyAC,
  validateSendReplacementNotification,
  sendReplacementNotification
)
router.get(
  '/viewCourseslots',
  verifyToken,
  validateViewcourseslot,
  viewCourseslots
)
router.post(
  '/sendAnnualLeaveRequest',
  verifyToken,
  verifyAC,
  validateAnnualLeaveRequest,
  sendAnnualLeaveRequest
)
router.put(
  '/acceptReplacementRequest',
  verifyToken,
  verifyAC,
  validateAcceptReplacementRequest,
  acceptReplacementRequest
)
router.put(
  '/rejectReplacementRequest',
  verifyToken,
  verifyAC,
  validateRejectReplacementRequest,
  rejectReplacementRequest
)
router.get(
  '/viewReplacementRequests',
  verifyToken,
  verifyAC,
  validateViewReplacementRequest,
  viewReplacementRequests
)

router.post(
  '/viewSlotLinkingStatus',
  verifyToken,
  verifyAC,
  validateviewSlotLinkingStatus,
  viewSlotLinkingStatus
)
router.post(
  '/sendCompensationLeave',
  verifyToken,
  verifyAC,
  validateSendCompensationLeave,
  sendCompensationLeave
)
router.post(
  '/sendSickLeaves',
  verifyToken,
  verifyAC,
  validateSendSickLeave,
  sendSickLeave
)
router.post(
  '/sendMaternityLeaves',
  verifyToken,
  verifyAC,
  validateSendMaternityLeave,
  sendMaternityLeave
)
router.post(
  '/sendAccidentalLeaves',
  verifyToken,
  verifyAC,
  validateSendaccidentalLeave,
  sendAccidentalLeave
)
router.post(
  '/sendChangeDayOff',
  verifyToken,
  verifyAC,
  validateSendChangeDayOff,
  changeDayOff
)
router.post(
  '/uploadDocument',
  upload.single('image'),
  verifyToken,
  verifyAC,
  validateUploadDocument,
  uploadDocument
)

router.post(
  '/sendSlotLinkingRequests',
  verifyToken,
  verifyAC,
  validateSendSlotLinkingRequest,
  sendSlotLinkingRequests
)

router.put(
  '/notifyAcceptRejectRequest',
  verifyToken,
  verifyAC,
  validateNotifyAcceptRejectRequest,
  notifyAcceptRejectRequest
)
router.put(
  '/notifyDelete',
  verifyToken,

  removeNotification
)
const {
  viewSchedule,
  viewMyCourses,
} = require('../controllers/academicMembers.controller')
const {
  validateViewSchedule,
} = require('../middleware/validations/academicMembers.validations')

router.get(
  '/viewSchedule',
  verifyToken,
  verifyAC,
  validateViewSchedule,
  viewSchedule
)
router.get(
  '/viewMyCourses',
  verifyToken,
  verifyAC,
  validateViewSchedule,
  viewMyCourses
)
router.post(
  '/viewRequestsStatus',

  verifyToken,
  verifyAC,
  validateViewRequestsStatus,
  viewRequestsStatus
)
router.delete(
  '/cancelRequest',

  verifyToken,
  verifyAC,
  validateCancelRequest,
  cancelRequest
)
router.get(
  '/viewAllUploads',

  verifyToken,
  verifyAC,
  ViewAllMyUploads
)
module.exports = router
