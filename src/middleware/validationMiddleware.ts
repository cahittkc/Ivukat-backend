import { Request, Response, NextFunction } from 'express';
import { validate, ValidationError } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { ApiError } from '../utils/ApiError';
import { StatusCodes } from 'http-status-codes';
import { ParsedQs } from 'qs';

export const validateRequest = (dtoClass: any) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const dtoInstance = plainToInstance(dtoClass, req.method === 'GET' ? req.query : req.body, {
                excludeExtraneousValues: false,
                enableImplicitConversion: true
            });

            const errors = await validate(dtoInstance, {
                whitelist: true,
                forbidNonWhitelisted: true,
                skipMissingProperties: true
            });

            if (errors.length > 0) {
                const validationErrors = errors.map((error: ValidationError) => ({
                    property: error.property,
                    constraints: error.constraints,
                    value: error.value
                }));

                throw new ApiError(
                    StatusCodes.BAD_REQUEST,
                    'Validation failed',
                    validationErrors
                );
            }

            // Eğer GET isteği ise, query parametrelerini güncelle
            if (req.method === 'GET') {
                req.query = dtoInstance as unknown as ParsedQs;
            } else {
                req.body = dtoInstance;
            }

            next();
        } catch (error) {
            next(error);
        }
    };
}; 