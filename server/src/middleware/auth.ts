import { config } from "dotenv";
import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { pool } from "../dbConfig";
config();

const SECRET_KEY = process.env.JWT_SECRET || "";

export interface AuthenticatedRequest<
	Body = any,
	Query = any,
	Params = any,
	Headers extends Record<string, any> = Record<string, any>
> extends Request<Params, any, Body, Query, Headers> {
	user?: number;
	rawBody?: any;
	body: Body;
	query: Query;
	params: Params;
	headers: Headers;
	cookies: Record<string, any>;
}

const requireAuth = (req: Request, res: Response, next: NextFunction) => {
	const token = req.cookies.jwt;

	if (!token) {
		res.status(401).json({ error: "Unauthorized access" });

		return;
	}

	jwt.verify(token, SECRET_KEY, (error: any) => {
		if (error) {
			res.status(401).json({ error: "Unauthorized access" });

			return;
		} else {
			next();
		}
	});
};

async function checkUser(
	req: AuthenticatedRequest,
	res: Response,
	next: NextFunction
) {
	const token = req.cookies.jwt;

	if (!token) {
		return res.status(401).json({ error: "Unauthorized access" });
	}

	const client = await pool.connect();
	try {
		const decoded: any = jwt.verify(token, SECRET_KEY);
		const { id } = decoded;

		const result = await client.query(
			`SELECT index_number FROM students WHERE id = $1`,
			[id]
		);

		if (result.rowCount! > 0) {
			req.user = result.rows[0].index_number;

			next();
		} else {
			return res.status(404).json({ error: "User not found" });
		}
	} catch (err) {
		res.status(401).json({ error: "Unauthorized access" });

		return;
	} finally {
		client.release();
	}
}

export { checkUser, requireAuth };
