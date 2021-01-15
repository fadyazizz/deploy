const jwt = require('jsonwebtoken')

const { signingKey } = require('../../config/keys_dev')
const statusCodes = require('../constants/statusCodes')
const tokenModel = require('../../models/token')
const {
  youAreNotAHR,
  youAreNotAHOD,
  youAreNotACourseCoordinator,
  youAreNotCourseInstructor,
} = require('../errorCodes')

const verifyToken =async (req, res, next) => {
  try {
    const tokenExist=await tokenModel.findOne({token:req.headers.authorization})
    if(tokenExist){
      return res.json({error:"You've been logged out , please logIn again"})
    }
    return jwt.verify(req.headers.authorization, signingKey, (err, payload) => {
      if (!err) {
        // console.log('3adet el token verify')
        const header = req.headers.authorization
        const token = header
        req.data = payload
        req.token = token
        return next()
      }
      return res.json({
        statuscode: statusCodes.authentication,
        error: 'you are not authorized',
      })
    })
  } catch (exception) {
    console.log(exception)
  }
}

const verifyHr = (req, res, next) => {
  if (req.data.role == 'HR') {
    //console.log('verify hr')
    return next()
  }
  return res.json({
    error: 'you are not a HR member yalaaaaaa',
    statuscode: youAreNotAHR,
  })
}

const verifyAC = (req, res, next) => {
  if (req.data.role == 'AcademicMember') {
    console.log('verify Academicmember')
    return next()
  }
  return res.json({
    error: 'you are not a Academic member member yalaaaaaa',
    statuscode: youAreNotAHR,
  })
}
const verifyHOD = (req, res, next) => {
  if (req.data.roleOfAcademicMember == 'HeadOfDepartment') {
    console.log('verify HeadOddepartment')
    return next()
  }
  return res.json({
    error: 'you are not a HOD member yalaaaaaa',
    statuscode: youAreNotAHOD,
  })
}
const verifycoursecoordinator = (req, res, next) => {
  if (req.data.roleOfAcademicMember == 'CourseCoordinator') {
    //console.log('verify HeadOddepartment')
    return next()
  }
  return res.json({
    error: 'you are not a CourseCoordinator member yalaaaaaa',
    statuscode: youAreNotACourseCoordinator,
  })
}

const verifycourseInstructor = (req, res, next) => {
  if (req.data.roleOfAcademicMember == 'CourseInstructor') {
    //console.log('verify HeadOddepartment')
    return next()
  }
  return res.json({
    error: 'you are not a CourseInstructor member yalaaaaaa',
    statuscode: youAreNotCourseInstructor,
  })
}

module.exports = {
  verifyToken,
  verifyHr,
  verifyHOD,
  verifycoursecoordinator,
  verifycourseInstructor,
  verifyAC,
}
