import { AuthService } from '../services/AuthService';
import { UserRepository } from '../repositories/UserRepository';
import { RegisterDto, RefreshTokenDto } from '../dtos/auth.dto';
import { successResponse } from '../utils/responseHandler';
import { StatusCodes } from 'http-status-codes';
import { NextFunction } from 'express';
import { ApiError } from '../utils/ApiError';
import { LoginDto } from '../dtos/auth.dto';
import { Request, Response } from 'express';
import { RefreshTokenRepository } from '../repositories/RefreshTokenRepository';






export class AuthController {
    private authService: AuthService;
    private userRepository: UserRepository;
    private refreshTokenRepository : RefreshTokenRepository


    constructor() {
        this.authService = new AuthService();
        this.userRepository = new UserRepository();
        this.refreshTokenRepository = new RefreshTokenRepository();
    }


    private sanitizeUser(user: any) {
        const sanitizedUser = { ...user };
        delete sanitizedUser.password; // Remove password from the response
        return sanitizedUser;
    }

    private sanitizeUserResponse(user: any) {
        const sanitizedUser = {
            id : user.id,
            username: user.username,
        }
        return sanitizedUser;
    }


   

    register = async (req: any, res: any, next : NextFunction) => {
        try {
            const userData = req.body as RegisterDto;
            const user = await this.authService.register(userData);
            const sanitizedUser = this.sanitizeUser(user);
            successResponse(res,sanitizedUser, 'User registered successfully', StatusCodes.CREATED);
        } catch (error : any) {
            if (error.code === '23505') { // PostgreSQL unique violation error code
                // Get the constraint name from the error message
                const constraintMatch = error.detail?.match(/\"(.+?)\"/);
                const constraint = constraintMatch ? constraintMatch[1] : '';
                
                // Get the value that caused the duplicate from the error message
                const valueMatch = error.detail?.match(/=\((.+?)\)/);
                const value = valueMatch ? valueMatch[1] : '';
                
                // Map constraint names to user-friendly field names and messages
                let fieldName = 'field';
                let message = 'Registration failed due to duplicate entry';
                
                if (constraint.includes('users_email_key')) {
                    fieldName = 'email';
                    message = `The email address "${value}" is already registered. Please use a different email or try logging in.`;
                } else if (constraint.includes('users_username_key')) {
                    fieldName = 'username';
                    message = `The username "${value}" is already taken. Please choose a different username.`;
                }
                
                next(new ApiError(StatusCodes.CONFLICT, message, { 
                    error: error.message,
                    field: fieldName,
                    value: value
                }));
            } else if (error instanceof ApiError) {
                // If it's already an ApiError, pass it through
                next(error);
            } else {
                // For other errors, create a generic error message
                next(new ApiError(
                    StatusCodes.BAD_REQUEST,
                    'Registration failed. Please check your input and try again.',
                    { error: error.message }
                ));
            }
        }
    }

    login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { username, password } = req.body as LoginDto;
            const { user, accessToken, refreshToken, expiresIn } = await this.authService.login(username, password, req);

            // Set refresh token in HTTP-only cookie
            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
            });

            const sanitizedUser = this.sanitizeUserResponse(user);
            successResponse(res, { 
                ...sanitizedUser, 
                accessToken,
                expiresIn
            }, 'Login successful', StatusCodes.OK);
        } catch (error: any) {
            if (error instanceof ApiError) {
                next(error);
            } else {
                next(new ApiError(
                    StatusCodes.UNAUTHORIZED, 
                    'Invalid credentials. Please check your email/username and password.',
                    { error: error.message }
                ));
            }
        }
    };

    refreshToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {

            const authHeader = req.headers.authorization;
            if (!authHeader) {
                return next(new ApiError(StatusCodes.UNAUTHORIZED, 'No authorization header provided'));
            }
            const accessToken = authHeader.split(' ')[1];
            if (!accessToken) {
                return next(new ApiError(StatusCodes.UNAUTHORIZED, 'Invalid token format'));
            }

            // 2. Access token'dan user ID'yi çıkar
            const decodedToken = AuthService.verifyToken(accessToken);
            if (!decodedToken) {
                return next(new ApiError(StatusCodes.UNAUTHORIZED, 'Invalid token'));
            }

            // 3. User ID'ye göre geçerli refresh token'ı bul
            const refreshToken = await this.refreshTokenRepository.findValidTokenByUserId(decodedToken.id);
            if (!refreshToken) {
                return next(new ApiError(StatusCodes.UNAUTHORIZED, 'No valid refresh token found'));
            }

            // 4. Yeni token'ları oluştur
            const result = await this.authService.refresh(refreshToken.token);
            
            successResponse(res, { 
                accessToken: result.accessToken,
                expiresIn: result.expiresIn
            }, 'Token refreshed successfully', StatusCodes.OK);

            
        } catch (error: any) {
            if (error instanceof ApiError) {
                next(error);
            } else {
                next(new ApiError(
                    StatusCodes.UNAUTHORIZED, 
                    'Token refresh failed. Please log in again.',
                    { error: error.message }
                ));
            }
        }
    };

    logout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            
            const authHeader = req.headers.authorization;
            if (!authHeader) {
                return next(new ApiError(StatusCodes.UNAUTHORIZED, 'No authorization header provided'));
            }
            const token = authHeader.split(' ')[1]; // Bearer <token>
            if (!token) {
                return next(new ApiError(StatusCodes.UNAUTHORIZED, 'Invalid token format'));
            }

            const decodedToken = AuthService.verifyToken(token);// Extract refresh token from cookies            
            
            
            if (decodedToken) {
                await this.authService.logout(decodedToken.id);
            }

            // Clear refresh token cookie
            res.clearCookie('refreshToken');
            successResponse(res, { 
                message: 'Logged out successfully' 
            }, 'Logout successful', StatusCodes.OK);
        } catch (error: any) {
            if (error instanceof ApiError) {
                next(error);
            } else {
                next(new ApiError(
                    StatusCodes.INTERNAL_SERVER_ERROR, 
                    'Logout failed. Please try again.',
                    { error: error.message }
                ));
            }
        }
    };

    session = async(req : Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const authHeader = req.headers.authorization;
            if (!authHeader) {
                return next(new ApiError(StatusCodes.UNAUTHORIZED, 'No authorization header provided'));
            }
            const token = authHeader.split(' ')[1]; // Bearer <token>
            if (!token) {
                return next(new ApiError(StatusCodes.UNAUTHORIZED, 'Invalid token format'));
            }

            const decodedToken = AuthService.verifyToken(token);

            if(!decodedToken){
                return next(new ApiError(StatusCodes.UNAUTHORIZED, 'Invalid token format'));
            }

            const user = await this.authService.sessionInfo(decodedToken.id)

            successResponse(res, user, 'session verified succesfull', StatusCodes.OK);
            
        } catch (error: any) {
            if (error instanceof ApiError) {
                next(error);
            } else {
                next(new ApiError(
                    StatusCodes.INTERNAL_SERVER_ERROR, 
                    'Session failed. Please try again.',
                    { error: error.message }
                ));
            }
        }
    }
}