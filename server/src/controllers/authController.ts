import { compare, genSalt, hash } from "bcrypt";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { pool } from "../dbConfig";
import { registerSchema } from "../routes/authRoute";

type RegisterInput = z.infer<typeof registerSchema>;

export const handleSuccess = (res: Response, message: string, data?: any) => {
	return res.status(200).json({ success: true, message, data });
};

export const handleError = (
	res: Response,
	message: string,
	errors?: any,
	statusCode = 400
) => {
	return res.status(statusCode).json({ success: false, message, errors });
};

const JWT_SECRET = process.env.JWT_SECRET;
function createToken(id: string) {
	if (JWT_SECRET) {
		return jwt.sign({ id }, JWT_SECRET, { expiresIn: "30d" });
	}
}

const register = async (req: Request<{}, {}, RegisterInput>, res: Response) => {
	const { email, fullName, password, role } = req.body;

	try {
		if (role === "student") {
			await pool.query(`DELETE FROM students`);
			const salt = await genSalt(12);
			const hashedPassword = await hash(password, salt);

			const { rows: studentId } = await pool.query(
				`INSERT INTO students (email, fullname, password) VALUES ($1, $2, $3) RETURNING id`,
				[email, fullName, hashedPassword]
			);

			if (studentId.length > 0) {
				const token = createToken(studentId[0].id);

				res.cookie("jwt", token).status(200).json({
					success: true,
					message: "Registration Complete!🎊",
					data: {},
				});
			} else {
				handleError(res, "Could not complete registration");
			}
		}
	} catch (error: any) {
		console.log("🚀 ~ register ~ error:", error);

		if (error.code === "23505") {
			handleError(res, "Email already in use.", {}, 400);
			return;
		}
		handleError(res, "", error, 500);
	}
};

const login = async (req: Request<{}, {}, RegisterInput>, res: Response) => {
	const { email, fullName, password, role } = req.body;

	try {
		// if (role === "student") {
		const { rows: details } = await pool.query(
			`SELECT id, password FROM students WHERE email = $1`,
			[email]
		);

		if (details.length > 0) {
			const hashedPassword = details[0].password;

			// Compare password
			const isMatching = await compare(password, hashedPassword);

			if (isMatching) {
				const id = details[0].id;
				const token = createToken(id);

				res.cookie("jwt", token).status(200).json({
					success: true,
					message: "Registration Complete!🎊",
				});
			} else {
				handleError(
					res,
					"Invalid credentials. Please check your input"
				);
			}
		} else {
			handleError(
				res,
				"We couldn't find an account with that email. Please check and try again."
			);
		}
		// }
	} catch (error: any) {
		console.log("🚀 ~ register ~ error:", error);

		if (error.code === "23505") {
			handleError(res, "Email already in use.", {}, 400);
			return;
		}
		handleError(res, "", error, 500);
	}
};

export { login, register };
