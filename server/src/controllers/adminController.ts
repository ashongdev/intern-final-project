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

const fetchStudentsList = async (req: Request, res: Response) => {
	try {
		const { rows } = await pool.query(`
         SELECT i.*, s.email, s.fullname, s.faculty, s.phone, o.name AS organization_name, sp.fullname AS supervisor_name, sp.id AS supervisor_id FROM internship_requests i
         JOIN students s
            ON s.index_number = i.student_id
			JOIN organizations o
				ON o.id = i.organization_id
			LEFT JOIN supervisors sp
				ON sp.organization_id = o.id`);
		handleSuccess(res, "", rows);
	} catch (error) {
		console.log("🚀 ---------------------------------------🚀");
		console.log("🚀 ~ fetchLetterRequests ~ error:", error);
		console.log("🚀 ---------------------------------------🚀");
		handleError(res, "Error", error);
	}
};

export { fetchLetterRequests, fetchStudentsList };
