import { NextFunction, Request, Response, Router } from "express";
import { login, register } from "../controllers/authController";

const router = Router();

import { z } from "zod";

export const registerSchema = z
	.object({
		fullName: z.string().min(2, "Full name must be at least 2 characters"),
		email: z.string().email("Please enter a valid email address"),
		password: z.string().min(8, "Password must be at least 8 characters"),
		confirmPassword: z.string(),
		role: z.enum(["student", "organization"] as const, {
			message: "Please select a role",
		}),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "Passwords don't match",
		path: ["confirmPassword"],
	});

export const loginSchema = z.object({
	email: z.string().email("Please enter a valid email address"),
	password: z.string().min(1, "Password is required"),
});

export const validate =
	(schema: any) =>
	(
		req: Request<{}, {}, z.infer<typeof registerSchema>>,
		res: Response,
		next: NextFunction
	) => {
		try {
			const sanitizedBody = {
				...req.body,
				fullName: req.body.fullName?.trim(),
				email: req.body.email?.trim().toLowerCase(),
			};
			schema.parse(sanitizedBody);
			next();
		} catch (err: any) {
			console.log("🚀 ~ validate ~ err:", err);
			return res.status(420).json({ errors: err.errors });
		}
	};

router.post("/register", validate(registerSchema), register);
router.post("/login", validate(loginSchema), login);

export default router;
