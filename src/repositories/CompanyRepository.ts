import {AppDataSource} from "../config/db";
import { Company } from "../entities/Company";
import { Repository } from "typeorm";



export class CompanyRepository {
    private repository: Repository<Company>;

    constructor() {
        this.repository = AppDataSource.getRepository(Company);
    }

    async create(data: Partial<Company>): Promise<Company> {
        const company = this.repository.create(data);
        return await this.repository.save(company);
    }

    async findById(id: number): Promise<Company | null> {
        return await this.repository.findOne({
            where: { id }
        });
    }

    async getAll(): Promise<Company[]> {
        return await this.repository.find();
    }
}