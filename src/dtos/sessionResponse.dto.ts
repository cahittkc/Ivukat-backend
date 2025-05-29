import { IsString, IsEmail, MinLength, IsOptional, IsEnum, IsNumber, IsBoolean, IsInt, isBoolean, IsObject } from 'class-validator';
import { Exclude, Expose, Type } from 'class-transformer';

class RoleDto {
    @Expose()
    id: number;

    @Expose()
    name: string;

    @Expose()
    description: string;
}

class CompanyDto {
    @Expose()
    id: number;

    @Expose()
    name: string;

    @Expose()
    address: string;

    @Expose()
    phoneNumber: string;

    @Expose()
    email: string;
}

export class SessionDto {
    @Expose()
    id: number;

    @Expose()
    username: string;

    @Expose()
    email: string;

    @Expose()
    firstName: string;

    @Expose()
    lastName: string;

    @Expose()
    isVerified: boolean;

    @Expose()
    isOwner: boolean;

    @Expose()
    createdAt: string;

    @Expose()
    @Type(() => RoleDto)
    role: RoleDto;

    @Expose()
    @Type(() => CompanyDto)
    company: CompanyDto;
}






