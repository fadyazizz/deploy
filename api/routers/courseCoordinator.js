const express = require('express')

const router = express.Router()
const {
  verifyToken,
  verifycoursecoordinator,
} = require('../helpers/accounts.helpers')
const {
  viewSlotLinkingRequests,
  addCourseSlot,
  deleteCourseSlot,
  updateCourseSlot,
  rejectSlotLinkingRequests,
   acceptSlotLinkingRequests
} = require('../controllers/courseCoordinator.controller')
const {
  validateViewSlotLinkingRequest,
  validateAddCourseSlot,
  validateDeleteCourseSlot,
  validateUpdateCourseSlot,
  validateRejectSlotLinkingRequests,
  validateacceptSlotLinkingRequests
} = require('../middleware/validations/courseCoordinator.validations')
router.get(
  '/viewSlotLinkingRequests',
  verifyToken,
  verifycoursecoordinator,
  validateViewSlotLinkingRequest,
  viewSlotLinkingRequests
)
router.put('/acceptSlotLinkingRequests', verifyToken,
verifycoursecoordinator, validateacceptSlotLinkingRequests, acceptSlotLinkingRequests)
router.put('/rejectSlotLinkingRequests', verifyToken,
verifycoursecoordinator, validateRejectSlotLinkingRequests, rejectSlotLinkingRequests)
router.post('/addCourseSlot',verifyToken,
verifycoursecoordinator, validateAddCourseSlot, addCourseSlot)
router.delete('/deleteCourseSlot',verifyToken,
verifycoursecoordinator, validateDeleteCourseSlot, deleteCourseSlot)
router.put('/updateCourseSlot',verifyToken,
verifycoursecoordinator, validateUpdateCourseSlot, updateCourseSlot)
module.exports = router
