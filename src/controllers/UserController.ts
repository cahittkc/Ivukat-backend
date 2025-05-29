import {NextFunction, Request, Response} from 'express';
import { ApiError } from '../utils/ApiError';
import { UserRepository } from '../repositories/UserRepository';
import { successResponse } from '../utils/responseHandler';
import { StatusCodes } from 'http-status-codes';




export class UserController {
    private userRepository: UserRepository;

    constructor() {
        this.userRepository = new UserRepository();
    }


    private sanitizeUsers(users: any[]): any[] {
        return users.map(user => {
            const { password, role, ...restUser } = user;
    
            let sanitizedRole = null;
            if (role) {
                // Role objesinden priority alanını çıkarıyoruz
                const {id,priority, createdAt, updatedAt, ...newRole } = role;
                sanitizedRole = newRole;
            }
    
            return {
                ...restUser,
                role: sanitizedRole
            };
        });
    }


    createUser = async (req: Request, res: Response, next : NextFunction): Promise<void> => {
        try {
            const user = await this.userRepository.create(req.body);
            successResponse(res, user,'Current user retrieved successfully', StatusCodes.OK);
        } catch (error : any) {
            next(new ApiError(StatusCodes.BAD_REQUEST, 'Failed to create user: ' + error.message));
        }
    }

    getUserById = async (req: Request, res: Response, next : NextFunction): Promise<void> => {
        try {
            const user = await this.userRepository.findById(Number(req.params.id));
            if (!user) {
                throw new ApiError(StatusCodes.NOT_FOUND, 'User not found');
            }
            successResponse(res, user,'Current user retrieved successfully', StatusCodes.OK);
        } catch (error : any) {
            next(new ApiError(StatusCodes.BAD_REQUEST, 'Failed to retrieve user: ' + error.message));
        }
    }

    getAllUsers = async (req: Request, res: Response, next : NextFunction): Promise<void> => {
        try {
            const users = await this.userRepository.getAll();
            const sanitizedUsers = this.sanitizeUsers(users);
            successResponse(res, sanitizedUsers,'All users retrieved successfully', StatusCodes.OK);
        } catch (error : any) {
            next(new ApiError(StatusCodes.BAD_REQUEST, 'Failed to retrieve users: ' + error.message));
        }
    }


    getCompanyEmployees = async (req: Request, res: Response, next : NextFunction): Promise<void> => {
        try {
            const companyId = Number(req.body.companyId);
            const employees = await this.userRepository.getCompanyEmployees(companyId);
            successResponse(res, employees,'Company employees retrieved successfully', StatusCodes.OK);
        } catch (error : any) {
            next(new ApiError(StatusCodes.BAD_REQUEST, 'Failed to retrieve company employees: ' + error.message));
        }
    }

    getCompanyOwners = async (req: Request, res: Response, next : NextFunction): Promise<void> => {
        try {
            const companyId = Number(req.body.companyId);
            const owners = await this.userRepository.getCompanyOwners(companyId);
            successResponse(res, owners,'Company owners retrieved successfully', StatusCodes.OK);
        } catch (error : any) {
            next(new ApiError(StatusCodes.BAD_REQUEST, 'Failed to retrieve company owners: ' + error.message));
        }
    }
}