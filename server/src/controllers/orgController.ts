import { Response } from "express";
import { pool } from "../dbConfig";
import { handleSuccess } from "../exports/export";
import { AuthenticatedRequest } from "../middleware/auth";

const fetchAllRequests = async (req: AuthenticatedRequest, res: Response) => {
	// const orgId = req.user;

	try {
		const { rows } = await pool.query(
			`SELECT i.id, i.student_id, s.fullname, s.programme, i.status, i.created_at AS submitted_at
         FROM internship_requests i
         JOIN students s
            ON s.index_number = i.student_id
         WHERE i.organization_id = $1`,
			[1]
		);
		handleSuccess(res, "", rows);
	} catch (error) {
		console.log("🚀 ------------------------------------🚀");
		console.log("🚀 ~ fetchAllRequests ~ error:", error);
		console.log("🚀 ------------------------------------🚀");
	}
};

export { fetchAllRequests };
