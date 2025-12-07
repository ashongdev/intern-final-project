import { Request, Response } from "express";
import { pool } from "../dbConfig";
import { handleError, handleSuccess } from "../exports/export";

const fetchLetterRequests = async (req: Request, res: Response) => {
	try {
		const { rows } = await pool.query(`
         SELECT l.*, s.email, s.fullname, s.faculty FROM letter_requests l
         JOIN students s
            ON s.index_number = l.student_id`);
		handleSuccess(res, "", rows);
	} catch (error) {
		console.log("🚀 ---------------------------------------🚀");
		console.log("🚀 ~ fetchLetterRequests ~ error:", error);
		console.log("🚀 ---------------------------------------🚀");
		handleError(res, "Error", error);
	}
};

export { fetchLetterRequests };
