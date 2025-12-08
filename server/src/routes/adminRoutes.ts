import { Router } from "express";
import {
	fetchLetterRequests,
	fetchStudentsList,
} from "../controllers/adminController";

const router = Router();

router.get("/letters", fetchLetterRequests);
router.get("/students", fetchStudentsList);

export default router;
