import { Response } from "express";
import { pool } from "../dbConfig";
import { handleError, handleSuccess } from "../exports/export";
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

const actionClick = async (req: AuthenticatedRequest, res: Response) => {
	const { id, action } = req.body;
	const orgId = req.user;

	let status = null;
	if (action === "accept") status = "accepted";
	else if (action === "reject") status = "rejected";
	else {
		handleError(res, "Invalid status");
		return;
	}

	const client = await pool.connect();
	try {
		await client.query(`BEGIN`);

		const reqRes = await client.query(
			`SELECT student_id FROM internship_requests WHERE id = $1`,
			[id]
		);
		const { rows: orgName } = await client.query(
			`SELECT name FROM organizations WHERE id = $1`,
			[orgId || 1]
		);
		const organizationName = orgName[0].name;

		if (reqRes.rowCount === 0) {
			await client.query(`ROLLBACK`);
			handleError(res, "Request not found");
			return;
		}

		const studentId = reqRes.rows[0].student_id;

		await client.query(
			`UPDATE internship_requests SET status = $1 WHERE id = $2`,
			[status, id]
		);

		const subject =
			action === "accept" ? "Request Approved" : "Request Rejected";
		const content =
			action === "accept"
				? `Your internship request to ${organizationName} has been approved.`
				: `Your internship request to ${organizationName} has been rejected.`;

		await client.query(
			`INSERT INTO student_notifications (student_id, subject, content)
       VALUES ($1, $2, $3)`,
			[studentId, subject, content]
		);

		await client.query(`COMMIT`);
		handleSuccess(res, "", { ok: true });
	} catch (error) {
		await client.query(`ROLLBACK`);
		console.log("🚀 Error:", error);
		handleError(res, "Something went wrong");
	} finally {
		client.release();
	}
};

export { actionClick, fetchAllRequests };
