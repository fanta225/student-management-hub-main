import { Router } from "express";
import pool from "../config/pg.js";
import upload from "../middleware/upload.js";
import fs from "fs";
import path from "path";

const stdRoute = Router();

/* ================= REGISTER ================= */
stdRoute.post("/create-std", async (req, res) => {
  const client = await pool.connect();

  try {
    const { fullName, studentId, username, password } = req.body;

    if (!fullName || !studentId || !username || !password) {
      return res.status(400).json({ err: "ข้อมูลไม่ครบ" });
    }

    await client.query("BEGIN");

    const checkStdId = await client.query(
      "SELECT 1 FROM students WHERE std_class_id = $1",
      [studentId]
    );

    if (checkStdId.rows.length > 0) {
      await client.query("ROLLBACK");
      return res.json({ err: "มีรหัสนักศึกษานี้แล้ว" });
    }

    const checkUsername = await client.query(
      "SELECT 1 FROM students WHERE username = $1",
      [username]
    );

    if (checkUsername.rows.length > 0) {
      await client.query("ROLLBACK");
      return res.json({ err: "มี username นี้แล้ว" });
    }

    await client.query(
      `
      INSERT INTO students (fullname,std_class_id,username,password,major)
      VALUES ($1,$2,$3,$4,$5)
      `,
      [fullName, studentId, username, password, "IT"]
    );

    await client.query("COMMIT");
    return res.json({ ok: true });
  } catch (error) {
    await client.query("ROLLBACK");
    return res.status(500).json({ err: error.message });
  } finally {
    client.release();
  }
});

/* ================= LOGIN ================= */
stdRoute.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    let role = 1;
    let result = await pool.query(
      "SELECT * FROM students WHERE username=$1 AND password=$2",
      [username, password]
    );

    if (result.rows.length < 1) {
      role = 2;
      result = await pool.query(
        "SELECT * FROM professors WHERE username=$1 AND password=$2",
        [username, password]
      );
    }

    if (result.rows.length === 0)
      return res.status(401).json({ err: "login ไม่ถูกต้อง" });

    res.json({ data: { ...result.rows[0], role } });
  } catch (error) {
    res.status(500).json({ err: error.message });
  }
});

/* ================= UPDATE STUDENT ================= */
stdRoute.put("/students/:id", upload.single("profile"), async (req, res) => {
  const client = await pool.connect();

  try {
    const { id } = req.params;
    const fullname = req.body.fullname || req.body.fullName;
    const { major } = req.body;
    const filePath = req.file ? req.file.path : null;

    await client.query("BEGIN");

    const student = await client.query(
      "SELECT profile FROM students WHERE student_id=$1",
      [id]
    );

    if (!student.rows.length) {
      await client.query("ROLLBACK");
      return res.status(404).json({ err: "ไม่พบนักเรียน" });
    }

    const oldProfile = student.rows[0].profile;

    if (filePath && oldProfile && fs.existsSync(oldProfile))
      await fs.promises.unlink(oldProfile);

    const result = await client.query(
      `
      UPDATE students
      SET fullname = COALESCE($1,fullname),
          major = COALESCE($2,major),
          profile = COALESCE($3,profile)
      WHERE student_id=$4
      RETURNING *
      `,
      [fullname ?? null, major ?? null, filePath ?? null, id]
    );

    await client.query("COMMIT");
    res.json({ ok: true, data: result.rows[0] });
  } catch (error) {
    await client.query("ROLLBACK");
    res.status(500).json({ err: error.message });
  } finally {
    client.release();
  }
});

/* ================= GET ONE ================= */
stdRoute.get("/students/:id", async (req, res) => {
  const result = await pool.query(
    "SELECT * FROM students WHERE student_id=$1",
    [req.params.id]
  );

  if (!result.rows.length) return res.status(404).json({ err: "ไม่พบข้อมูล" });

  res.json({ data: result.rows[0] });
});

/* ================= DELETE ================= */
stdRoute.delete("/students/:id", async (req, res) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    await client.query("DELETE FROM enrollments WHERE student_id=$1", [
      req.params.id,
    ]);
    await client.query("DELETE FROM students WHERE student_id=$1", [
      req.params.id,
    ]);
    await client.query("COMMIT");
    res.json({ ok: true });
  } catch (e) {
    await client.query("ROLLBACK");
    res.status(500).json({ err: e.message });
  } finally {
    client.release();
  }
});

/* ================= GET ALL ================= */
stdRoute.get("/students", async (req, res) => {
  const result = await pool.query(`
    SELECT *
    FROM students
    ORDER BY student_id
  `);

  res.json({ total: result.rows.length, data: result.rows });
});

/* ================= CHECK CLASS ================= */
stdRoute.post("/check-class", upload.single("leavDoc"), async (req, res) => {
  const { classId, stdId } = req.body;
  const filePath = req.file?.path || null;

  const course = await pool.query(
    "SELECT time_check FROM courses WHERE course_id=$1",
    [classId]
  );

  const status =
    new Date().toTimeString().slice(0, 8) > course.rows[0].time_check
      ? "มาสาย"
      : "ตรงเวลา";

  await pool.query(
    `
    INSERT INTO attendance(course_id,student_id,checkin_time,status,leave_file)
    VALUES ($1,$2,NOW(),$3,$4)
    `,
    [classId, stdId, status, filePath]
  );

  res.json({ ok: true, status });
});

export default stdRoute;
