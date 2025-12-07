import { Request, Response } from "express";
import z from "zod";
import { pool } from "../dbConfig";
import { handleSuccess } from "../exports/export";
import { letterRequestSchema } from "../routes/studentRoute";

const submitLetterRequest = async (
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
		console.log(req.body);
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
		console.log("🚀 ~ submitLetterRequest ~ error:", error);
		console.log("🚀 ---------------------------------------🚀");
	}
};

export { submitLetterRequest };
