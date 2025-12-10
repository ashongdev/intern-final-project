import { Router } from "express";
import { fetchAllRequests } from "../controllers/orgController";

const router = Router();

router.get("/requests/all", fetchAllRequests);

export default router;
