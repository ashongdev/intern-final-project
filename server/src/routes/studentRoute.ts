import { NextFunction, Request, Response, Router } from "express";
import { z } from "zod";
import {
	fetchLetterData,
	fetchRequestsHistory,
	submitLetterRequest,
} from "../controllers/studentController";
import { checkUser, requireAuth } from "../middleware/auth";

const router = Router();

export const letterRequestSchema = z.object({
	studentId: z.string().regex(/^\d{10}$/, "Index must be exactly 10 digits"),
	internshipType: z.enum(["mandatory", "voluntary"], {
		message: "Please select a valid internship type",
	}),
	organizationName: z.string().optional(),
	startDate: z.string().datetime("Invalid start date"),
	endDate: z.string().datetime("Invalid end date"),
	additionalNotes: z.string().optional(),
});

export const validate =
	(schema: typeof letterRequestSchema) =>
	(
		req: Request<{}, {}, z.infer<typeof letterRequestSchema>>,
		res: Response,
		next: NextFunction
	) => {
		try {
			const sanitizedBody = {
				...req.body,
				organizationName: req.body.organizationName?.trim(),
				additionalNotes: req.body.additionalNotes?.trim(),
			};

			req.body = schema.parse(sanitizedBody);
			next();
		} catch (err: any) {
			return res.status(420).json({ errors: err.errors });
		}
	};

router.use((req, res, next) => {
	checkUser(req, res, next);
});

router.post(
	"/submit-letter",
	validate(letterRequestSchema),
	submitLetterRequest
);
router.get("/letter-history", requireAuth, fetchRequestsHistory);
router.get("/letter/:id", requireAuth, fetchLetterData);

export default router;
