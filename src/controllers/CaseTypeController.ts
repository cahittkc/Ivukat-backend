import { Request, Response, NextFunction } from "express";
import { CaseTypeRepository } from "../repositories/CaseTypeRepository";
import { StatusCodes } from "http-status-codes";
import { ApiError } from "../utils/ApiError";
import { successResponse } from "../utils/responseHandler";

export class CaseTypeController {
    private caseTypeRepository: CaseTypeRepository;

    constructor() {
        this.caseTypeRepository = new CaseTypeRepository();
    }

    // Yeni case type ekle
    create = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { name } = req.body;
            if (!name) {
                throw ApiError.badRequest("Case type name is required");
            }
            const existing = await this.caseTypeRepository.findByName(name);
            if (existing) {
                throw ApiError.conflict("Case type with this name already exists");
            }
            const caseType = await this.caseTypeRepository.create({ name });
            successResponse(res, caseType, "Case type created", StatusCodes.CREATED);
        } catch (error) {
            next(error);
        }
    };

    // Tüm case type'ları getir
    getAll = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const caseTypes = await this.caseTypeRepository.getAll();
            successResponse(res, caseTypes, "Case types listed", StatusCodes.OK);
        } catch (error) {
            next(error);
        }
    };

    // ID ile case type getir
    getById = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = Number(req.params.id);
            const caseType = await this.caseTypeRepository.findById(id);
            if (!caseType) {
                throw ApiError.notFound("Case type not found");
            }
            successResponse(res, caseType, "Case type found", StatusCodes.OK);
        } catch (error) {
            next(error);
        }
    };

    // İsme göre case type getir
    getByName = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const name = req.params.name;
            const caseType = await this.caseTypeRepository.findByName(name);
            if (!caseType) {
                throw ApiError.notFound("Case type not found");
            }
            successResponse(res, caseType, "Case type found", StatusCodes.OK);
        } catch (error) {
            next(error);
        }
    };

    // Sil
    delete = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = Number(req.params.id);
            await this.caseTypeRepository.deleteById(id);
            successResponse(res, null, "Case type deleted", StatusCodes.OK);
        } catch (error) {
            next(error);
        }
    };
}