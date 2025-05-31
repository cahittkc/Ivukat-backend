import { IsString, IsEmail, MinLength, IsOptional, IsEnum, IsNumber, IsBoolean, IsInt, isBoolean } from 'class-validator';
import { Exclude, Expose } from 'class-transformer';



export class CaseBySelfDto {
    @IsNumber()
    userId : number

    @IsNumber()
    companyId : number

    @IsBoolean()
    isOwner : boolean
}