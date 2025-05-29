import { AppDataSource } from "../config/db";
import { CaseType } from "../entities/CaseType";
import { Repository } from "typeorm";

export class CaseTypeRepository {
    private repository: Repository<CaseType>;

    constructor() {
        this.repository = AppDataSource.getRepository(CaseType);
    }

    async create(data: Partial<CaseType>): Promise<CaseType> {
        const caseType = this.repository.create(data);
        return await this.repository.save(caseType);
    }

    async findById(id: number): Promise<CaseType | null> {
        return await this.repository.findOne({ where: { id } });
    }

    async findByName(name: string): Promise<CaseType | null> {
        return await this.repository.findOne({ where: { name } });
    }

    async getAll(): Promise<CaseType[]> {
        return await this.repository.find();
    }

    async deleteById(id: number): Promise<void> {
        await this.repository.delete(id);
    }
}