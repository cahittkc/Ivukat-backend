import {AppDataSource} from "../config/db";
import { User } from "../entities/User";
import { Repository } from "typeorm";




export class UserRepository {
    private repository: Repository<User>;

    constructor() {
        this.repository = AppDataSource.getRepository(User);
    }

    async create(data: Partial<User>): Promise<User> {
        const user = this.repository.create(data);
        
        return await this.repository.save(user);
    }


    async findById(id: number): Promise<User | null> {
        return await this.repository.findOne({
            where: { id },
            relations: ['role', 'company']
        });
    }

    async findByEmail(email: string): Promise<User | null> {
        return await this.repository.findOne({
            where: { email }
        });
    }

    async findByUsername(username: string): Promise<User | null> {
        return await this.repository.findOne({
            where: { username },
            relations : ['role','company']
        });
    }


    async getAll(): Promise<User[]> {
        return await this.repository.find();
    }

    async getCompanyEmployees(companyId: number, roleId?: number): Promise<User[]> {
        const whereCondition: any = {
            company: { id: companyId },
            isOwner: false,
            
        };

        if (roleId) {
            whereCondition.role = { id: roleId };
        }

        return await this.repository.find({
            select: {
                id: true,
                firstName: true,
                middleName: true,
                lastName: true
            },
            where: whereCondition,
            relations: ['role']
        });
    }

    async getCompanyOwners(companyId: number): Promise<User[]> {
        return await this.repository.find({
            where: { 
                company: { id: companyId },
                isOwner: true // Exclude owners
             },
        });
    }

}
