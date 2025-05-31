// src/controllers/CaseController.ts
import { Request, Response, NextFunction } from "express";
import { CaseService } from "../services/CaseService";
import { successResponse } from "../utils/responseHandler";
import { StatusCodes } from "http-status-codes";
import { ApiError } from "../utils/ApiError";
import { CaseBySelfDto } from "../dtos/getcasebyself.dto"; 

export class CaseController {
    private caseService: CaseService;

    constructor() {
        this.caseService = new CaseService();
    }

    create = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { title, description, companyId, typeId, lawyerIds } = req.body;
            const caseEntity = await this.caseService.createCase({ title, description, companyId, typeId, lawyerIds });
            successResponse(res, caseEntity, "Case created", StatusCodes.CREATED);
        } catch (error) {
            next(error);
        }
    };

    getAll = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const cases = await this.caseService.getAllCases();
            successResponse(res, cases, "Cases listed", StatusCodes.OK);
        } catch (error) {
            next(error);
        }
    };

    getById = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = Number(req.params.id);
            const caseEntity = await this.caseService.getCaseById(id);
            successResponse(res, caseEntity, "Case found", StatusCodes.OK);
        } catch (error) {
            next(error);
        }
    };

    getByCompany = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const companyId = Number(req.params.companyId);
            if (isNaN(companyId)) {
                return next(new ApiError(StatusCodes.BAD_REQUEST, 'Invalid company ID'));
            }
            const cases = await this.caseService.getCasesByCompany(companyId);
            successResponse(res, cases, "Cases for company listed", StatusCodes.OK);
        } catch (error) {
            next(error);
        }
    };

    getByLawyer = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = Number(req.params.userId);
            const cases = await this.caseService.getCasesByLawyer(userId);
            successResponse(res, cases, "Cases for lawyer listed", StatusCodes.OK);
        } catch (error) {
            next(error);
        }
    };

    getByType = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const typeId = Number(req.params.typeId);
            const cases = await this.caseService.getCasesByType(typeId);
            successResponse(res, cases, "Cases for type listed", StatusCodes.OK);
        } catch (error) {
            next(error);
        }
    };

    update = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = Number(req.params.id);
            const caseEntity = await this.caseService.updateCase(id, req.body);
            successResponse(res, caseEntity, "Case updated", StatusCodes.OK);
        } catch (error) {
            next(error);
        }
    };

    delete = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = Number(req.params.id);
            await this.caseService.deleteCase(id);
            successResponse(res, null, "Case deleted", StatusCodes.OK);
        } catch (error) {
            next(error);
        }
    };

    addLawyer = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { caseId, lawyerId } = req.body; // { "lawyerId": 7 }
            const updatedCase = await this.caseService.addLawyerToCase(caseId, lawyerId);
            successResponse(res, updatedCase, "Lawyer added to case", StatusCodes.OK);
        } catch (error) {
            next(error);
        }
    };

    removeLawyers = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { caseId } = req.body;
            const { lawyerIds } = req.body;

            if (!lawyerIds || !Array.isArray(lawyerIds)) {
                return next(new ApiError(StatusCodes.BAD_REQUEST, 'lawyerIds must be an array'));
            }

            const result = await this.caseService.removeLawyersFromCase(Number(caseId), lawyerIds);
            successResponse(res, result, 'Lawyers removed successfully', StatusCodes.OK);
        } catch (error: any) {
            if (error instanceof ApiError) {
                next(error);
            } else {
                next(new ApiError(
                    StatusCodes.INTERNAL_SERVER_ERROR,
                    'Failed to remove lawyers from case',
                    { error: error.message }
                ));
            }
        }
    };

    getCaseBySelf = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const body =  req.body as CaseBySelfDto
            const data = await this.caseService.getCasesBySelf(body);
            successResponse(res, data, 'Cases Listed Succesfull', StatusCodes.OK)
        } catch (error: any) {
            if (error instanceof ApiError) {
                next(error);
            } else {
                next(new ApiError(
                    StatusCodes.INTERNAL_SERVER_ERROR,
                    'Failed to remove lawyers from case',
                    { error: error.message }
                ));
            }
        }
    }
}