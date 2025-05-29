import {NextFunction, Request, Response} from 'express';
import { ApiError } from '../utils/ApiError';
import { CompanyRepository } from '../repositories/CompanyRepository';
import { successResponse } from '../utils/responseHandler';
import { StatusCodes } from 'http-status-codes';



export class CompanyController {
    private companyRepository: CompanyRepository;

    constructor() {
        this.companyRepository = new CompanyRepository();
    }


    createCompany = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const company = await this.companyRepository.create(req.body);
            successResponse(res, company, 'Company created successfully', StatusCodes.CREATED);
        } catch (error: any) {
            next(new ApiError(StatusCodes.BAD_REQUEST, 'Failed to create company: ' + error.message));
        }
    }
    getCompanyById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const company = await this.companyRepository.findById(Number(req.params.id));
            if (!company) {
                throw new ApiError(StatusCodes.NOT_FOUND, 'Company not found');
            }
            successResponse(res, company, 'Company retrieved successfully', StatusCodes.OK);
        } catch (error: any) {
            next(new ApiError(StatusCodes.BAD_REQUEST, 'Failed to retrieve company: ' + error.message));
        }
    }

    getAllCompanies = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const companies = await this.companyRepository.getAll();
            successResponse(res, companies, 'Companies retrieved successfully', StatusCodes.OK);
        } catch (error: any) {
            next(new ApiError(StatusCodes.BAD_REQUEST, 'Failed to retrieve companies: ' + error.message));
        }
    }
}