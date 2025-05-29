import { Router, RequestHandler } from "express";
import { CaseController } from "../controllers/CaseController";

const router = Router();
const controller = new CaseController();

router.post("/add-case", controller.create as RequestHandler);
router.get("/get-all-cases", controller.getAll as RequestHandler);
router.get("/get-case-by-id/:id", controller.getById as RequestHandler);
router.get("/get-cases-by-company/:companyId", controller.getByCompany as RequestHandler);
router.get("/get-cases-by-lawyer/:userId", controller.getByLawyer as RequestHandler);
router.get("/get-cases-by-type/:typeId", controller.getByType as RequestHandler);
router.post("/add-lawyer", controller.addLawyer as RequestHandler);
router.post("/remove-lawyers", controller.removeLawyers as RequestHandler);
router.put("/update-case/:id", controller.update as RequestHandler);
router.delete("/delete-case/:id", controller.delete as RequestHandler);

export default router;