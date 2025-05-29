import { Router,RequestHandler } from "express";


import { CompanyController } from "../controllers/CompanyController";


const router = Router();
const companyController = new CompanyController();



// Company routes
router.post("/add-company", companyController.createCompany as RequestHandler);




export default router;