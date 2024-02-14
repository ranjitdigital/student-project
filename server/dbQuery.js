const addSub = `CREATE OR REPLACE FUNCTION add_sub(
    subject VARCHAR(100)
)
RETURNS TABLE (
    subject_id INT,
    sub_name VARCHAR(100)
) AS $$ 
BEGIN
    INSERT INTO master_tbl_subjects(sub_name) VALUES(subject);
    RETURN QUERY SELECT * FROM master_tbl_subjects WHERE master_tbl_subjects.sub_name = subject ;
END;
$$ LANGUAGE plpgsql;`

const addStudent = `CREATE OR REPLACE FUNCTION add_students_data(
    emailId VARCHAR(100),
    firstName VARCHAR(100),
    lastName VARCHAR(100),
    subject INTEGER[] 
)
RETURNS TABLE (
email VARCHAR(100),
first_name VARCHAR(100),
last_name VARCHAR(100) ,
subjects INTEGER[] 
) AS $$ 
BEGIN
RETURN QUERY 
INSERT INTO tbl_students(email,first_name,last_name,subjects) VALUES(emailId,firstName,lastName,subject)
RETURNING tbl_students.email,tbl_students.first_name,tbl_students.last_name,tbl_students.subjects;
END;
$$ LANGUAGE plpgsql;`

const filterBy =`CREATE OR REPLACE FUNCTION searchBy(
    p_firstname TEXT DEFAULT NULL,
    p_lastname TEXT DEFAULT NULL,
    p_email TEXT DEFAULT NULL,
    p_limit INT DEFAULT NULL,
    p_offset INT DEFAULT NULL
) 
RETURNS SETOF tbl_students
AS $$
BEGIN
    RETURN QUERY
    SELECT *
    FROM tbl_students
    WHERE 
        (p_firstname IS NULL OR first_name = p_firstname)
        AND (p_lastname IS NULL OR last_name = p_lastname)
        AND(p_email IS NULL OR email = p_email)
        ORDER BY tbl_students.id DESC
        LIMIT p_limit
        OFFSET p_offset;
END;
$$ LANGUAGE plpgsql;
;
`
const update =`CREATE OR REPLACE FUNCTION update_data(
    p_firstname TEXT DEFAULT NULL,
    p_lastname TEXT DEFAULT NULL,
    p_email TEXT DEFAULT NULL
)
RETURNS TABLE (
    email VARCHAR(100),
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    subjects INTEGER[] 
)
AS $$
BEGIN
    RETURN QUERY
    UPDATE tbl_students 
    SET first_name = COALESCE(p_firstname,tbl_students.first_name), last_name = COALESCE(p_lastname,tbl_students.last_name)
    WHERE tbl_students.email = p_email 
    RETURNING tbl_students.email, tbl_students.first_name, tbl_students.last_name, tbl_students.subjects;
END;
$$ LANGUAGE plpgsql;
;
    `
module.exports={addSub,addStudent,filterBy,update}