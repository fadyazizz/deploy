const express = require('express')

const router = express.Router()
const {
  verifyToken,
  verifycourseInstructor,
} = require('../helpers/accounts.helpers')
const {
  viewCoursesCoverageCI,
  assignAcademicMemberToSlots,
  deleteAssignmentAcademicMemberToSlots,
  upateAssignmenttAcademicMemberToSlots,
  viewStaffInMyDepartment,
  viewStaffInMyCourses,
  viewSlotsAssignment,
  assignAcademicMemberToCourseCoordinator,
  removeAcademicMember,
  viewStaffPerCourse,
  assignmentAcademicToCourse,
  deleteCourseAssignment,
  viewUnassignedSlots,
} = require('../../api/controllers/courseInstructor.controller')
const {
  validateViewCourseCoverageCI,
  validateAssignAcademicMemberToSlot,
  validateUpateAssignment,
  validateDeleteAssignment,
  validateviewStaffInMyDepartment,
  validateviewStaffInMyCourses,
  validateviewSlotsAssignment,
  validateassignAcademicMemberToCourseCoordinator,
  validateRemoveAcademicMember,
  validateViewStaffPerCourse,
  validateDeleteCourseAssignment,
  ValidateAssignmentAcademicToCourse,
  viewUnassignedSlotValidation,
} = require('../middleware/validations/courseInstructor.validations')
router.get(
  '/viewCoursesCoverageCI',
  verifyToken,
  verifycourseInstructor,
  validateViewCourseCoverageCI,
  viewCoursesCoverageCI
)
router.post(
  '/assignAcademicMemberToSlot',
  verifyToken,
  verifycourseInstructor,
  validateAssignAcademicMemberToSlot,
  assignAcademicMemberToSlots
)
router.delete(
  '/deleteAssignmentAcademicMemberToSlots',
  verifyToken,
  verifycourseInstructor,
  validateUpateAssignment,
  deleteAssignmentAcademicMemberToSlots
)
router.put(
  '/upateAssignmenttAcademicMemberToSlots',
  verifyToken,
  verifycourseInstructor,
  validateDeleteAssignment,
  upateAssignmenttAcademicMemberToSlots
)
router.delete(
  '/deleteAssignment',
  verifyToken,
  verifycourseInstructor,
  validateDeleteCourseAssignment,
  deleteCourseAssignment
)
router.post(
  '/assignmentAcademicToCourse',
  verifyToken,
  verifycourseInstructor,
  ValidateAssignmentAcademicToCourse,
  assignmentAcademicToCourse
)
router.post(
  '/viewUnassignedSlots',
  verifyToken,
  verifycourseInstructor,
  viewUnassignedSlotValidation,
  viewUnassignedSlots
)

router.get(
  '/viewSlotsAssignment',
  verifyToken,
  verifycourseInstructor,
  validateviewSlotsAssignment,
  viewSlotsAssignment
)
router.get(
  '/viewStaffInMyDepartment',
  verifyToken,
  verifycourseInstructor,
  validateviewStaffInMyDepartment,
  viewStaffInMyDepartment
)
router.get(
  '/viewStaffInMyCourses',
  verifyToken,
  verifycourseInstructor,
  validateviewStaffInMyCourses,
  viewStaffInMyCourses
)
router.post(
  '/viewStaffPerCourse',
  verifyToken,
  verifycourseInstructor,
  validateViewStaffPerCourse,
  viewStaffPerCourse
)
router.post(
  '/assignACToCourseCoordinator',
  verifyToken,
  verifycourseInstructor,
  validateassignAcademicMemberToCourseCoordinator,
  assignAcademicMemberToCourseCoordinator
)
router.delete(
  '/removeAcademicMember',
  verifyToken,
  verifycourseInstructor,
  validateRemoveAcademicMember,
  removeAcademicMember
)

module.exports = router
