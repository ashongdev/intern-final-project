import { Router } from "express";
import { actionClick, fetchAllRequests } from "../controllers/orgController";

const router = Router();

router.get("/requests/all", fetchAllRequests);
router.put("/accept-request", actionClick);

export default router;
