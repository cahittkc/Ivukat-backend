import { Response } from 'express';
import { StatusCodes } from 'http-status-codes';

interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T | null;
}

export const successResponse = <T>(
    res: Response,
    data: T | null = null,
    message: string = 'Success',
    statusCode: number = StatusCodes.OK
): void => {
    const response: ApiResponse<T> = {
        success: true,
        message,
        data
    };
    res.status(statusCode).json(response);
};

export const errorResponse = (
    res: Response,
    message: string = 'Internal Server Error',
    statusCode: number = StatusCodes.INTERNAL_SERVER_ERROR
): void => {
    const response: ApiResponse<null> = {
        success: false,
        message,
        data: null
    };
    res.status(statusCode).json(response);
}; 