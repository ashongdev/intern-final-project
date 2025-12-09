import { Router } from "express";
import {
	fetchLetterRequests,
	fetchStudentsList,
	letterApproval,
} from "../controllers/adminController";

const router = Router();

router.get("/letters", fetchLetterRequests);
router.get("/students", fetchStudentsList);
router.put("/approval", letterApproval);

export default router;
