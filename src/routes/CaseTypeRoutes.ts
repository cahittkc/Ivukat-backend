import { Router, RequestHandler } from "express";
import { CaseTypeController } from "../controllers/CaseTypeController";

const router = Router();
const controller = new CaseTypeController();

router.post("/add-case-type", controller.create as RequestHandler);
router.get("/get-all-case-types", controller.getAll as RequestHandler);
router.get("/get-case-type-by-id/:id", controller.getById as RequestHandler);
router.get("/get-case-type-by-name/:name", controller.getByName as RequestHandler);
router.delete("/delete-case-type/:id", controller.delete as RequestHandler);

export default router;