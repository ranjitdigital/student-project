const express = require("express");
const router = express.Router();
const{allStudents, createStudent, searchStudents, updateStudent, createSubject, allSubjects}=require('./controller')

// students apis
router.post('/student',createStudent);
router.get('/student',allStudents);
router.get('/search',searchStudents);
router.patch('/:email',updateStudent);
// subjects apis
router.post('/sub',createSubject);
router.get('/subjects',allSubjects);




module.exports=router