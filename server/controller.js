const pool = require('./db');
var validator = require('validator');

// create student

exports.createStudent = async (req, res) => {
    try {
        const { email, firstName, lastName, subjects } = req.body;
        if (!validator.isEmail(email)) {
            return res.status(400).send({ message: 'invaild emailId' })
        }
        const findEmail = await pool.query(`SELECT *  FROM tbl_students WHERE tbl_students.email=$1`, [email])
        if (findEmail.rows.length > 0) {
            return res.status(409).send({ messege: "email already exist" })
        }
        if (firstName.length < 3 || lastName.length < 3) {
            return res.status(400).send({ message: "please provide vaild firstname or lastname" })
        }
        const subjectIds = subjects.map(Number); 
        if (subjectIds.length < 2 || subjectIds.length > 5) {
            return res.status(400).send({ message: "please add more than 2 or less than 6 subjects" })
        } else {
            for (let id of subjectIds) {
                const { rows } = await pool.query(`SELECT *  FROM master_tbl_subjects WHERE master_tbl_subjects.subject_id=$1`, [id])
                if (rows.length < 1) {
                    return res.status(404).send({ message: "subject is not exists" })
                }
            }
        }
        const result = await pool.query(
            `SELECT add_students_data($1,$2,$3,$4)`, [email, firstName, lastName, subjectIds],
        );
        return res.status(201).send(result.rows[0])

    } catch (err) {
        console.log(err)
        return res.status(500).send('Internal server error')
    }

}
// get all student lists

exports.allStudents = async (req, res) => {
    try {
        const { search,limit=10,pageNumber=1 } = req.query;
        let query = 'SELECT * FROM tbl_students';
        let offset=(pageNumber-1)*limit;
    
        if (search) {
          query += ` WHERE lower(first_name) LIKE $1 OR lower(last_name) LIKE $1 OR lower(email) LIKE $1`;
          const result = await pool.query(query, [`%${search.toLowerCase()}%`]);
          if (result.rows.length < 1) {
            return res.status(404).send({ message: "student not found" })
        }
          return res. status(200).send(result.rows);
        } 
        const result = await pool.query(
            `SELECT * FROM tbl_students ORDER BY id DESC LIMIT $1 OFFSET $2`,
            [limit, offset]
          );
       
        if (result.rows.length < 1) {
            return res.status(404).send({ message: "student not found" })
        }
        return res.send(result.rows);
       
   

    } catch (err) {
        console.log(err)
        return res.status(500).send('Internal server error')
    }

}
// search students by query

exports.searchStudents = async (req, res) => {
    try {
        const { first_name, last_name, email, limit=10,pageNumber=1 } = req.query;
        let offset=(pageNumber-1)*limit;
        const result = await pool.query('SELECT * FROM searchBy($1, $2, $3,$4,$5)', [first_name || null, last_name || null, email || null, limit ,offset]);
        if (result.rows.length < 1) {
            return res.status(404).send({ message: "student not found" })
        }
        return res.status(200).send(result.rows);
    } catch (err) {
        console.error(err);
        return res.status(500).send('Internal server error')
    }
}
// update students data

exports.updateStudent = async (req, res) => {
    try {
        const email = req.params.email
        const { first_name, last_name } = req.body
        const {rows} = await pool.query(`SELECT *  FROM tbl_students WHERE tbl_students.email=$1`, [email])
        if (rows.length < 1) {
            return res.status(409).send({ messege: "student not exist" })
        }
        const result = await pool.query('SELECT * FROM update_data($1, $2, $3)', [first_name || null, last_name || null, email || null]);
        return res.status(200).send(result.rows[0])

    } catch (err) {
        console.log(err)
        return res.status(500).send('Internal server error')
    }

}
// create subjects

exports.createSubject = async (req, res) => {
    try {

        const { subject } = req.body;
        if (subject.length < 2) {
            return res.status(400).send({ message: "please provide vaild subject name" })
        }

        const result = await pool.query(
            `SELECT add_sub($1)`, [subject],
        );
        return res.status(201).send(result.rows[0])

    } catch (err) {
        console.log(err)
        return res.status(500).send('Internal server error')
    }

}
// get all subject lists

exports.allSubjects = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM master_tbl_subjects')
        if (result.rows.length < 1) {
            return res.status(404).send({ messeage: "subjects not found" })
        }
        return res.status(200).send(result.rows);

    } catch (err) {
        console.log(err)
        return res.status(500).send('Internal server error')
    }
}

