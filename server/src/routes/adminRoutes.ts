import { Router } from "express";
import { fetchLetterRequests } from "../controllers/adminController";

const router = Router();

router.get("/letters", fetchLetterRequests);

export default router;
