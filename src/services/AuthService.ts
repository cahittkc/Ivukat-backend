import jwt from 'jsonwebtoken'
import { JWT_SECRET, JWT_EXPIRES_IN, REFRESH_TOKEN_SECRET, REFRESH_TOKEN_EXPIRES_IN, jwtOptions , refreshTokenOptions } from '../config/auth';
import { User } from '../entities/User';
import { UserRepository } from '../repositories/UserRepository';
import { RoleRepository } from '../repositories/RoleRepository';
import { CompanyRepository } from '../repositories/CompanyRepository';
import { RefreshTokenRepository } from '../repositories/RefreshTokenRepository';
import { ApiError } from '../utils/ApiError';
import { StatusCodes } from 'http-status-codes';
import { Request } from 'express';
import { RegisterDto } from '../dtos/auth.dto';
import bcrypt from 'bcryptjs';
import { plainToClass } from 'class-transformer';
import { SessionDto } from '../dtos/sessionResponse.dto';


export class AuthService {
    private userRepository: UserRepository;
    private roleRepository: RoleRepository;
    private companyRepository: CompanyRepository;
    private refreshTokenRepository: RefreshTokenRepository;

    constructor() {
        this.userRepository = new UserRepository();
        this.roleRepository = new RoleRepository();
        this.companyRepository = new CompanyRepository();
        this.refreshTokenRepository = new RefreshTokenRepository();
    }

    private parseExpiresIn(expiresIn: string): number {
        const match = expiresIn.match(/^(\d+)([mhd])$/);
        if (!match) {
            throw new Error('Invalid expiresIn format');
        }

        const [, value, unit] = match;
        const numValue = parseInt(value, 10);

        switch (unit) {
            case 'm': // minutes
                return numValue * 60;
            case 'h': // hours
                return numValue * 60 * 60;
            case 'd': // days
                return numValue * 24 * 60 * 60;
            default:
                throw new Error('Invalid time unit');
        }
    }

    private sanitizeRole(role: any) {
        const sanitizedRole = { ...role };
        delete sanitizedRole.priority;
        delete sanitizedRole.createdAt;
        delete sanitizedRole.updatedAt;
        return sanitizedRole;
    }


    async register(userData: RegisterDto): Promise<User> {
        // Check if email exists
        const existingUserByEmail = await this.userRepository.findByEmail(userData.email);
        if (existingUserByEmail) {
            throw ApiError.conflict('Email already exists');
        }

        // Check if username exists
        const existingUserByUsername = await this.userRepository.findByUsername(userData.username);
        if (existingUserByUsername) {
            throw ApiError.conflict('Username already exists');
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(userData.password, salt);

        if(userData.isOwner) {
            userData.roleId = 1; // Assuming roleId 1 is for owner
        }

        const role = await this.roleRepository.findById(userData.roleId);
        if (!role) {
            throw ApiError.notFound('Role not found');
        }

        const company = await this.companyRepository.findById(userData.companyId);
        if (!company) {
            throw ApiError.notFound('Company not found');
        }
        

        const sanitizedRole = this.sanitizeRole(role);
        
        const user = await this.userRepository.create({
            ...userData,
            password: hashedPassword,
            role :sanitizedRole,
            company
        });


        return user;
    }


    async login(username: string, password: string, req: Request): Promise<{
        user: Partial<User>, 
        accessToken: string,
        refreshToken: string,
        expiresIn: number
    }> {
        // Find user by username
        const user = await this.userRepository.findByUsername(username);
        if (!user) {
            throw ApiError.conflict('Invalid username');
        }

        // Check password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw ApiError.conflict('Invalid password');
        }

        // Generate tokens
        const accessToken = this.generateAccessToken(user);
        const refreshToken = this.generateRefreshToken(user);

        const expiresInSeconds = this.parseExpiresIn(JWT_EXPIRES_IN);
        
        // Timestamp hesaplama
        const expiresIn = Date.now() + (expiresInSeconds * 1000); // Saniyeyi milisaniyeye çevirip şimdiki zamana ekliyoruz

        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);

        await this.refreshTokenRepository.create({
            token: refreshToken,
            user: user,
            expiresAt,
            deviceInfo: req.headers['user-agent'],
            ipAddress: req.ip
        });

        const { password: _, ...userWithoutPassword } = user;

        return {
            user: userWithoutPassword,
            accessToken,
            refreshToken,
            expiresIn
        };
    }

    async refresh(refreshToken: string): Promise<{ 
        accessToken: string,
        expiresIn: number
    }> {
        try {
            // Find and validate refresh token
            console.log("refreshToken",refreshToken);
            
            const tokenDoc = await this.refreshTokenRepository.findByToken(refreshToken);

            console.log("tokendoc",tokenDoc);
            
            if (!tokenDoc || !tokenDoc.isValid || tokenDoc.expiresAt < new Date()) {
                throw ApiError.unauthorized('Invalid refresh token2');
            }

             
            await this.refreshTokenRepository.invalidateToken(refreshToken);

            const fullUser = await this.userRepository.findById(tokenDoc.user.id)

            if(!fullUser){
                throw ApiError.unauthorized('Invalid refresh token2')
            }

            // Generate new tokens
            const newAccessToken = this.generateAccessToken(fullUser);
            const newRefreshToken = this.generateRefreshToken(fullUser);

            // Calculate expiration time in seconds
            const expiresInSeconds = this.parseExpiresIn(JWT_EXPIRES_IN);

            const expiresIn = Date.now() + (expiresInSeconds * 1000); 

            // Invalidate old refresh token
            // await this.refreshTokenRepository.invalidateToken(refreshToken); // Tekrarlanan satır kaldırıldı

            // Save new refresh token
            const expiresAt = new Date();
            expiresAt.setDate(expiresAt.getDate() + 7);

            await this.refreshTokenRepository.create({
                token: newRefreshToken,
                user: tokenDoc.user,
                expiresAt,
                deviceInfo: tokenDoc.deviceInfo,
                ipAddress: tokenDoc.ipAddress
            });

            return {
                accessToken: newAccessToken,
                expiresIn
            };
        } catch (error: any) {
            console.error("Error in AuthService.refresh try block:", error);
            if (error instanceof ApiError) throw error;
            throw ApiError.unauthorized('Invalid refresh token3');
        }
    }

    async sessionInfo(userId: number): Promise<SessionDto> {
        try {
            const user = await this.userRepository.findById(userId);
            if (!user) {
                throw ApiError.notFound('No found any user');
            }

            const sanitizedUser = plainToClass(SessionDto, user, { excludeExtraneousValues: true });
            return sanitizedUser;
        } catch (error) {
            if (error instanceof ApiError) throw error;
            throw ApiError.unauthorized('Invalid refresh token');
        }
    }

    async logout(userId: number): Promise<void> {
        const refreshToken =  await this.refreshTokenRepository.findValidTokenByUserId(userId);
        if (!refreshToken) {
            throw ApiError.notFound('No valid refresh token found for user');
        }
        await this.refreshTokenRepository.invalidateToken(refreshToken.token);
        
    }

    private generateAccessToken(user: User): string {
        // Kullanıcının ve rolünün varlığını kontrol et
        if (!user || !user.role) {
            // Hata durumunu loglayabilir veya farklı bir işlem yapabilirsiniz
            console.error("Error: User or user role is undefined for access token generation.", user);
            throw new Error("Cannot generate access token: User or role information is missing.");
        }

        const payload = {
            id: user.id,
            email: user.email,
            username: user.username,
            role: user.role.name
        };

        return jwt.sign(payload, JWT_SECRET, jwtOptions);
    }

    private generateRefreshToken(user: User): string {
        const payload = {
            id: user.id,
            role: user.role.name
        };

        return jwt.sign(payload, REFRESH_TOKEN_SECRET, refreshTokenOptions);
    }

    static verifyToken(token: string): any {
        try {
            return jwt.verify(token, JWT_SECRET);
        } catch (error) {
            throw ApiError.unauthorized('Invalid token');
        }
    }

    
}