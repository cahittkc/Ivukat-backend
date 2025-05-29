import {NextFunction, Request, Response} from 'express';
import { ApiError } from '../utils/ApiError';
import { RoleRepository } from '../repositories/RoleRepository';
import { successResponse } from '../utils/responseHandler';
import { StatusCodes } from 'http-status-codes';



export class RoleController {
    private roleRepository: RoleRepository;

    constructor() {
        this.roleRepository = new RoleRepository();
    }

    createRole = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const role = await this.roleRepository.create(req.body);
            successResponse(res, role,'Role Added successfully', StatusCodes.OK);
        } catch (error : any) {
            next(new ApiError(StatusCodes.BAD_REQUEST, 'Failed to create role: ' + error.message));
        }
    }

    getAllRoles = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const roles = await this.roleRepository.getAll();
            if(roles.length > 0){
                const sanitizedRoles = roles.map(({ priority, ...rest }) => rest);
                successResponse(res, sanitizedRoles,'All roles listed', StatusCodes.OK);
            }
        } catch (error : any) {
            next(new ApiError(StatusCodes.BAD_REQUEST, 'Failed to retrieve roles: ' + error.message));
        }
    }

    updateRole = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const roleId = Number(req.body.id);
            // Check if role exists
            const existingRole = await this.roleRepository.findById(roleId);
            if (!existingRole) {
                throw ApiError.notFound('Role not found');
            }
            else {
                if(existingRole.name != req.body.name) {
                    throw ApiError.badRequest('Role name cannot be changed');
                }
            }

            

            // Don't allow updating admin role
            // if (existingRole.name === UserRole.ADMIN) {
            //     throw ApiError.forbidden('Cannot modify admin role');
            // }

            // Only allow updating the description, not the name
            const updatedRole = await this.roleRepository.update(roleId, req.body);
            successResponse(res, updatedRole, 'Role updated successfully', StatusCodes.OK);
        } catch (error: any) {
            next(error instanceof ApiError ? error : new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, 'Failed to update role', { error: error.message }));
        }
    };
}   