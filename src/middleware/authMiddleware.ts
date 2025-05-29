import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/AuthService';
import { ApiError } from '../utils/ApiError';

// Extend Express Request type to include user
declare global {
    namespace Express {
        interface Request {
            user?: any;
        }
    }
}

export const authenticate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            throw new ApiError(401, 'No token provided');
        }

        const token = authHeader.split(' ')[1]; // Bearer <token>
        if (!token && req.route.path != '/logout') {
            throw new ApiError(401, 'Invalid token format');
        }

        if(req.route.path != '/logout'){
            const decoded = AuthService.verifyToken(token);
            req.user = decoded;
            next();
        }else {
            next();
        }
        
    } catch (error) {
        if (error instanceof ApiError) {
            next(error);
        } else {
            next(new ApiError(401, 'Authentication failed'));
        }
    }
}; 