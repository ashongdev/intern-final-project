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

const fetchStudentsList = async (_: Request, res: Response) => {
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

const letterApproval = async (req: Request, res: Response) => {
	const { status, student_id } = req.body;

	const client = await pool.connect();

	const list = [
		{
			subject: "Letter Request Approved",
			content:
				"You letter has been successfully approved. You can find it on the Letter Requests page to download.",
			action_url: "",
			status: "Sent",
		},
		{
			subject: "Letter Request Rejected",
			content: "You letter has been rejected.",
			action_url: "",
			status: "Cancelled",
		},
	];

	let notificationInfo = null;
	if (status.toLowerCase() === "approve") {
		notificationInfo = list[0];
	} else {
		notificationInfo = list[1];
	}

	try {
		await client.query(`BEGIN`);
		await client.query(`DELETE FROM student_notifications`);
		const { rows: letterId } = await client.query(
			`UPDATE letter_requests SET status = $1, updated_at = NOW() WHERE student_id = $2 RETURNING id`,
			[notificationInfo?.status, student_id]
		);
		await client.query(
			`INSERT INTO student_notifications (student_id, content, subject)
			VALUES ($1, $2, $3)`,
			[student_id, notificationInfo?.content, notificationInfo?.subject]
		);
		await client.query(`COMMIT`);
		handleSuccess(res, notificationInfo?.subject! || "Success", {
			title: notificationInfo?.subject,
			description: notificationInfo?.content,
			letterId: letterId[0].id,
		});
	} catch (error) {
		await client.query(`ROLLBACK`);
		console.log("🚀 ----------------------------------🚀");
		console.log("🚀 ~ letterApproval ~ error:", error);
		console.log("🚀 ----------------------------------🚀");
		handleError(res, "", error);
	}
};

export { fetchLetterRequests, fetchStudentsList, letterApproval };
