import { Router } from "express";
import pool from "../config/pg.js";
const pRouter = Router();

pRouter.get("/get-all-professors", async (req, res) => {
  try {
    const query = `SELECT * FROM professors ORDER BY id ASC`;
    const result = await pool.query(query);

    res.status(200).json({
      message: "ดึงข้อมูลอาจารย์สำเร็จ",
      total: result.rows.length,
      data: result.rows,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "เกิดข้อผิดพลาดในการดึงข้อมูลอาจารย์",
    });
  }
});

// Get professor by ID
pRouter.get("/get-professor/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const query = `SELECT * FROM professors WHERE id = $1`;
    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "ไม่พบข้อมูลอาจารย์",
      });
    }

    res.status(200).json({
      message: "ดึงข้อมูลอาจารย์สำเร็จ",
      data: result.rows[0],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "เกิดข้อผิดพลาดในการดึงข้อมูลอาจารย์",
    });
  }
});

pRouter.post("/create-professor", async (req, res) => {
  try {
    // extended payload from frontend
    const { fullname, tel, username, password, email, department } = req.body;

    if (!fullname || !tel || !username || !password)
      return res.json({ err: "กรุณากรอกข้อมูลให้ครบถ้วน" });

    const usernameExit = await pool.query(
      "select id from professors where username = $1",
      [username],
    );
    if (usernameExit.rows.length > 0)
      return res.json({ err: "รหัสผู้ใช้งานนี้ถูกใช้แล้ว" });
    const stdUsernameExit = await pool.query(
      "select student_id from students where username = $1",
      [username],
    );
    if (stdUsernameExit.rows.length > 0)
      return res.json({ err: "รหัสผู้ใช้งานนี้ถูกใช้แล้ว" });

    const query = `
      INSERT INTO professors (fullname, tel, username, password, email, department)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;

    const result = await pool.query(query, [fullname, tel, username, password, email, department]);

    res.status(200).json({
      message: "เพิ่มข้อมูลอาจารย์สำเร็จ",
      data: result.rows[0],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "เกิดข้อผิดพลาดในการเพิ่มข้อมูลอาจารย์",
    });
  }
});

// Update professor
pRouter.put("/update-professor/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { fullname, tel, email, department } = req.body;
    if (!fullname || !tel) return res.json({ err: "กรอกช้อมูลให้ครบถ้วน" });

    const query = `
      UPDATE professors 
      SET fullname = $1, tel = $2, email = $3, department = $4
      WHERE id = $5
    `;

    const result = await pool.query(query, [fullname, tel, email, department, Number(id)]);

    res.status(200).json({
      message: "แก้ไขข้อมูลอาจารย์สำเร็จ",
      data: result.rows[0],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "เกิดข้อผิดพลาดในการแก้ไขข้อมูลอาจารย์",
    });
  }
});

// Delete professor
pRouter.delete("/delete-professor/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const query = `DELETE FROM professors WHERE id = $1 RETURNING *`;
    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "ไม่พบข้อมูลอาจารย์",
      });
    }

    res.status(200).json({
      message: "ลบข้อมูลอาจารย์สำเร็จ",
      data: result.rows[0],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "เกิดข้อผิดพลาดในการลบข้อมูลอาจารย์",
    });
  }
});

export default pRouter;
