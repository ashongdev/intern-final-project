import { Request, Response } from "express";
import path from "path";
import z from "zod";
import { pool } from "../dbConfig";
import { handleError, handleSuccess } from "../exports/export";
import { AuthenticatedRequest } from "../middleware/auth";
import { letterRequestSchema } from "../routes/studentRoute";

const requestLetter = async (
	req: Request<{}, {}, z.infer<typeof letterRequestSchema>>,
	res: Response
) => {
	const {
		endDate,
		internshipType,
		startDate,
		studentId,
		additionalNotes,
		organizationName,
	} = req.body;

	const client = await pool.connect();
	try {
		await client.query(`BEGIN`);
		// await client.query(`DELETE FROM letter_requests`);
		await client.query(
			`INSERT INTO letter_requests
            (student_id, internship_type, start_date, end_date, additonal_notes, organization_name)
         VALUES ($1, $2, $3, $4, $5, $6)`,
			[
				studentId,
				internshipType,
				startDate,
				endDate,
				additionalNotes,
				organizationName,
			]
		);

		// Update current step
		await client.query(
			`UPDATE user_step SET current_step = 2 WHERE student_id = $1`,
			[Number(studentId)]
		);
		await client.query(`COMMIT`);

		handleSuccess(res, "Letter Request Submitted");
	} catch (error) {
		await client.query(`ROLLBACK`);

		console.log("🚀 ---------------------------------------🚀");
		console.log("🚀 ~ requestLetter ~ error:", error);
		console.log("🚀 ---------------------------------------🚀");
	}
};

const submitInternshipLetter = async (
	req: AuthenticatedRequest,
	res: Response
) => {
	const { organizationEmail, additionalNotes, organizationName } =
		req.body.data;
	const studentId = req.user;

	const client = await pool.connect();
	try {
		await client.query(`BEGIN`);

		// Fetch organization's id
		const { rows: orgId } = await pool.query(
			`SELECT id FROM organizations WHERE email = $1`,
			[organizationEmail]
		);

		if (orgId.length < 1) {
			return handleError(
				res,
				"No organization with such email found on our system",
				{},
				404
			);
		}

		await client.query(
			`INSERT INTO internship_requests
            (student_id, organization_id)
         VALUES ($1, $2)`,
			[studentId, orgId[0].id]
		);

		// Update current step
		await client.query(
			`UPDATE user_step SET current_step = 3 WHERE student_id = $1`,
			[Number(studentId)]
		);
		await client.query(`COMMIT`);

		handleSuccess(res, "Letter Request Submitted");
	} catch (error) {
		await client.query(`ROLLBACK`);
	}
};

const fetchRequestsHistory = async (
	req: AuthenticatedRequest,
	res: Response
) => {
	// const { studentId } = req.body;
	const studentId = req.user;

	try {
		const { rows } = await pool.query(
			`SELECT * FROM letter_requests WHERE student_id = $1`,
			[studentId]
		);
		handleSuccess(res, "", { requests: rows });
	} catch (error) {
		console.log("🚀 --------------------------------------🚀");
		console.log("🚀 ~ fetchRequestsHistory ~ error:", error);
		console.log("🚀 --------------------------------------🚀");
	}
};

const fetchLetterData = async (req: AuthenticatedRequest, res: Response) => {
	const { id } = req.params;
	const studentId = req.user;

	try {
		const { rows: letter } = await pool.query(
			`SELECT * FROM letter_requests WHERE id = $1`,
			[id]
		);

		const { rows: studentInfo } = await pool.query(
			`SELECT fullname, index_number, programme FROM students WHERE index_number = $1`,
			[studentId]
		);

		const templatePath = path.join(
			__dirname,
			"../docs/letter_template.docx"
		);
		const templateUrl = `${req.protocol}://${req.get(
			"host"
		)}/${templatePath}`;

		handleSuccess(res, "", {
			letter: letter[0],
			studentInfo: studentInfo[0],
			templateUrl,
		});
	} catch (error) {
		console.log("🚀 --------------------------------------🚀");
		console.log("🚀 ~ fetchRequestsHistory ~ error:", error);
		console.log("🚀 --------------------------------------🚀");
	}
};

const fetchLatestSubmission = async (
	req: AuthenticatedRequest,
	res: Response
) => {
	const { id } = req.params;
	const studentId = req.user;

	try {
		const { rows: request } = await pool.query(
			`SELECT i.created_at, o.email AS organization_email, i.id AS id, o.name AS organization_name, i.status
			FROM internship_requests i
			JOIN organizations o
				ON o.id = i.organization_id
			WHERE i.student_id = $1
			ORDER BY i.created_at DESC
			LIMIT 1`,
			[studentId]
		);

		const { rows: studentInfo } = await pool.query(
			`SELECT fullname, index_number, programme FROM students WHERE index_number = $1`,
			[studentId]
		);

		const templatePath = path.join(
			__dirname,
			"../docs/letter_template.docx"
		);
		const templateUrl = `${req.protocol}://${req.get(
			"host"
		)}/${templatePath}`;

		handleSuccess(res, "", {
			request: request[0],
			studentInfo: studentInfo[0],
			templateUrl,
		});
	} catch (error) {
		console.log("🚀 --------------------------------------🚀");
		console.log("🚀 ~ fetchRequestsHistory ~ error:", error);
		console.log("🚀 --------------------------------------🚀");
	}
};

export {
	fetchLatestSubmission,
	fetchLetterData,
	fetchRequestsHistory,
	requestLetter,
	submitInternshipLetter,
};
