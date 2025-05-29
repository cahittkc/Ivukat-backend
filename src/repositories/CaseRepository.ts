import { AppDataSource } from "../config/db";
import { Case } from "../entities/Case";
import { Repository } from "typeorm";
import { Company } from "../entities/Company";
import { CaseType } from "../entities/CaseType";
import { User } from "../entities/User";

export class CaseRepository {
    private repository: Repository<Case>;

    constructor() {
        this.repository = AppDataSource.getRepository(Case);
    }

    async create(data: Partial<Case>): Promise<Case> {
        const caseEntity = this.repository.create(data);
        return await this.repository.save(caseEntity);
    }

    async findById(id: number): Promise<Case | null> {
        return await this.repository.findOne({
            where: { id },
            relations: ["company", "type", "lawyers"]
        });
    }

    async getAll(): Promise<Case[]> {
        return await this.repository.find({
            relations: ["company", "type", "lawyers"]
        });
    }

    async getByCompany(companyId: number): Promise<Case[]> {
        return await this.repository.find({
            where: { company: { id: companyId } },
            relations: ["company", "type", "lawyers"]
        });
    }

    async getByLawyer(userId: number): Promise<Case[]> {
        return await this.repository
            .createQueryBuilder("case")
            .leftJoinAndSelect("case.company", "company")
            .leftJoinAndSelect("case.type", "type")
            .leftJoinAndSelect("case.lawyers", "lawyer")
            .where("lawyer.id = :userId", { userId })
            .getMany();
    }

    async getByType(typeId: number): Promise<Case[]> {
        return await this.repository.find({
            where: { type: { id: typeId } },
            relations: ["company", "type", "lawyers"]
        });
    }

    async update(id: number, data: Partial<Case>): Promise<Case | null> {
        // 1. Önce case'i ilişkileriyle birlikte bul
        const caseEntity = await this.repository.findOne({ where: { id }, relations: ["lawyers", "company", "type"] });
        if (!caseEntity) return null;
    
        // 2. Diğer alanları güncelle
        if (data.title !== undefined) caseEntity.title = data.title;
        if (data.description !== undefined) caseEntity.description = data.description;
        if (data.type !== undefined) caseEntity.type = data.type;
        if (data.company !== undefined) caseEntity.company = data.company;
        if (data.lawyers !== undefined) caseEntity.lawyers = data.lawyers; // ManyToMany ilişkisi burada güncellenir
    
        // 3. Kaydet ve döndür
        return await this.repository.save(caseEntity);
    }

    async delete(id: number): Promise<void> {
        await this.repository.delete(id);
    }
}