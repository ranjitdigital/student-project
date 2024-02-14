const express = require("express");
const cors = require('cors')

const pool = require('./db')
const {addSub,addStudent,filterBy,update}=require('./dbQuery')
const app = express()
const router = require('./routes')
app.use(express.json());
app.use(cors())

pool.connect((err, client, release) => {
  if (err) {
    console.error('Error connecting to the database:', err);
  } else {
    console.log('Connected to the database successfully');
  }
  release()
});

async function createTable() {
  try {
    const query = `CREATE TABLE IF NOT EXISTS master_tbl_subjects (
        subject_id SERIAL PRIMARY KEY,
        sub_name VARCHAR(100) NOT NULL
    )`;
    const query2 = `
        CREATE TABLE IF NOT EXISTS tbl_students (
          id SERIAL,
          email VARCHAR(100)  UNIQUE NOT NULL PRIMARY KEY,
          first_name VARCHAR(100),
          last_name VARCHAR(100),
          subjects INTEGER[] 
         
        )
      `;
    await pool.query(query);
    console.log('master_tbl_subjects" created successfully');
    await pool.query(query2);
    console.log('Table "tbl_students" created successfully');

  } catch (error) {
    console.error('Error creating table:', error);
  }
}
// Execute the SQL function definition
async function executeFunction(addfunc) {
  try {
    await pool.query(addfunc);
    console.log(' function created successfully');
  } catch (error) {
    console.error('Error occurred while creating function:', error);
  }
}
 executeFunction(filterBy)
createTable();
app.use('/',router);

app.listen(4001, () => {
  console.log("server running at 4001")
})