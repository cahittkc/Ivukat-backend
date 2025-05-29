import { IsString, IsEmail, MinLength, IsOptional, IsEnum, IsNumber, IsBoolean, IsInt, isBoolean } from 'class-validator';
import { Exclude, Expose } from 'class-transformer';
import { Role } from '../entities/Role';



export class LoginDto {
    @IsString()
    username: string;

    @IsString()
    @MinLength(6)
    password: string;
}

export class LoginResponseDto {
    id: number;
    username: string;
    accessToken: string;
    expiresIn: number;
}

export class RegisterDto {
    @IsString()
    @MinLength(3)
    username: string;

    @IsString()
    @MinLength(3)
    firstName: string;

    @IsOptional()
    @IsString()
    @MinLength(3)
    middleName?: string;

    @IsString()
    @MinLength(3)
    lastName: string;

    @IsEmail()
    email: string; 

    @IsNumber()
    companyId: number;

    @IsBoolean()
    isOwner: boolean;

    @IsBoolean()
    isVerified: boolean;

    @MinLength(6)
    password: string;

    @IsNumber()
    roleId: number;
}

export class TokenResponseDto {
    user: {
        id: number;
        username: string;
        email: string;
        firstName?: string;
        lastName?: string;
        role: Object;
        createdAt: Date;
        updatedAt: Date;
    };
    accessToken: string;
    expiresIn: number;
}

export class RefreshTokenDto {
    @IsString()
    refreshToken: string;
}

