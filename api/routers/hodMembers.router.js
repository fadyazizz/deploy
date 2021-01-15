const express = require('express')
const router = express.Router()
const { verifyToken, verifyHOD } = require('../helpers/accounts.helpers')
const {
  viewAllRequests,
  acceptRequest,
  rejectRequest,
  viewCoursesCoverage,
  viewTeachingAssHOD,
  viewAllStaff,
  viewAllStaffPerCourse,
  viewStaffIDayOff,
  assignCourseInstructor,
  deleteCourseInstructor,
  updateCourseInstructor,
} = require('../controllers/hodMembers.controller')

const {
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
} = require('../middleware/validations/hodMembers.validations')

router.get(
  '/viewAllRequests',
  verifyToken,
  verifyHOD,
  validateViewAllRequests,
  viewAllRequests
)
router.put(
  '/acceptRequest',
  verifyToken,
  verifyHOD,
  validateAcceptRequest,
  acceptRequest
)

router.put(
  '/rejectRequest',
  verifyToken,
  verifyHOD,
  validateRejectRequest,
  rejectRequest
)
router.get(
  '/viewCoursesCoverage',
  verifyToken,
  verifyHOD,
  validateViewCourseCoverageHOD,
  viewCoursesCoverage
)
router.get(
  '/viewTeachingAssHOD',
  verifyToken,
  verifyHOD,
  validateViewTeachingassigns,
  viewTeachingAssHOD
)
router.get(
  '/viewStaffInMyDepartment',
  verifyToken,
  verifyHOD,
  validateAllViewStaffInMyDepartment,
  viewAllStaff
)
router.post(
  '/viewAllStaffPerCourse',
  verifyToken,
  verifyHOD,
  validateViewAllStaffPerCourse,
  viewAllStaffPerCourse
)
router.post(
  '/viewStaffDayOff',
  verifyToken,
  verifyHOD,
  validateStaffIDayOff,
  viewStaffIDayOff
)
router.post(
  '/assignCourseInstructor',
  verifyToken,
  verifyHOD,
  validateAssignCourseInstructor,
  assignCourseInstructor
)
router.delete(
  '/deleteCourseInstructor',
  verifyToken,
  verifyHOD,
  validateDeleteCourseInstructor,
  deleteCourseInstructor
)
router.put(
  '/updateCourseInstructor',
  verifyToken,
  verifyHOD,
  validateUpdateCourseInstructor,
  updateCourseInstructor
)
module.exports = router
