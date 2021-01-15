const express = require('express')
const router = express.Router()

const {
  logIn,
  viewProfile,
  signIn,
  signOut,
  viewAttendanceRecords,
  viewMissingDays,
  viewMissingHours,
  UpdateProfile,
  ResetPassword,
  logout,
} = require('../controllers/accounts.controller')
const {
  validateLogIn,
  validateViewProfile,
  validateSignIn,
  validateSignOut,
  validateViewAttendanceRecords,
  validateMissingDays,
  validateMissingHours,
  validateUpdateProfile,
  validateResetPassowrd,
  validateLogOut,
} = require('../middleware/validations/accounts.validations')

const { verifyToken } = require('../helpers/accounts.helpers')

// router.post('/signUp', validateCreateAccount, signUp)
router.post('/logIn', validateLogIn, logIn)
router.post('/logOut', validateLogOut, logout)

router.post('/viewProfile', verifyToken, validateViewProfile, viewProfile)
router.post('/signIn', verifyToken, validateSignIn, signIn)
router.put('/signOut', verifyToken, validateSignOut, signOut)
router.get(
  '/viewAttendanceRecords',
  verifyToken,
  validateViewAttendanceRecords,
  viewAttendanceRecords
)
router.get(
  '/viewMissingDays',
  verifyToken,
  validateMissingDays,
  viewMissingDays
)
router.get(
  '/viewMissingHours',
  verifyToken,
  validateMissingHours,
  viewMissingHours
)
router.put('/updateProfile', verifyToken, validateUpdateProfile, UpdateProfile)
router.put('/resetPassword', verifyToken, validateResetPassowrd, ResetPassword)
module.exports = router
