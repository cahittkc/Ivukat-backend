// src/services/CaseService.ts
import { CaseRepository } from "../repositories/CaseRepository";
import { CompanyRepository } from "../repositories/CompanyRepository";
import { CaseTypeRepository } from "../repositories/CaseTypeRepository";
import { UserRepository } from "../repositories/UserRepository";
import { ApiError } from "../utils/ApiError";
import { User } from "../entities/User";
import { CaseBySelfDto } from "../dtos/getcasebyself.dto";

export class CaseService {
    private caseRepository: CaseRepository;
    private companyRepository: CompanyRepository;
    private caseTypeRepository: CaseTypeRepository;
    private userRepository: UserRepository;

    constructor() {
        this.caseRepository = new CaseRepository();
        this.companyRepository = new CompanyRepository();
        this.caseTypeRepository = new CaseTypeRepository();
        this.userRepository = new UserRepository();
    }

    async createCase(data: {
        title: string;
        description?: string;
        companyId: number;
        typeId: number;
        lawyerIds: number[];
    }) {
        const company = await this.companyRepository.findById(data.companyId);
        if (!company) throw ApiError.notFound("Company not found");

        const type = await this.caseTypeRepository.findById(data.typeId);
        if (!type) throw ApiError.notFound("Case type not found");

        const lawyers = await Promise.all(
            data.lawyerIds.map(id => this.userRepository.findById(id))
        );
        if (lawyers.some(lawyer => !lawyer)) throw ApiError.notFound("One or more lawyers not found");

        return await this.caseRepository.create({
            title: data.title,
            description: data.description,
            company,
            type,
            lawyers: lawyers as any // TypeORM expects User[]
        });
    }

    async getAllCases() {
        return await this.caseRepository.getAll();
    }

    async getCaseById(id: number) {
        const caseEntity = await this.caseRepository.findById(id);
        if (!caseEntity) throw ApiError.notFound("Case not found");
        return caseEntity;
    }

    async getCasesByCompany(companyId: number) {
        return await this.caseRepository.getByCompany(companyId);
    }

    async getCasesByLawyer(userId: number) {
        return await this.caseRepository.getByLawyer(userId);
    }

    async getCasesByType(typeId: number) {
        return await this.caseRepository.getByType(typeId);
    }

    async updateCase(id: number, data: Partial<{ title: string; description: string; typeId: number; lawyerIds: number[] }>) {
        const updateData: any = {};
        if (data.title) updateData.title = data.title;
        if (data.description) updateData.description = data.description;
        if (data.typeId) {
            const type = await this.caseTypeRepository.findById(data.typeId);
            if (!type) throw ApiError.notFound("Case type not found");
            updateData.type = type;
        }
        if (data.lawyerIds) {
            const lawyers = await Promise.all(
                data.lawyerIds.map(id => this.userRepository.findById(id))
            );
            if (lawyers.some(lawyer => !lawyer)) throw ApiError.notFound("One or more lawyers not found");
            updateData.lawyers = lawyers;
        }
        return await this.caseRepository.update(id, updateData);
    }

    async deleteCase(id: number) {
        await this.caseRepository.delete(id);
    }

    async addLawyerToCase(caseId: number, lawyerId: number) {
        const caseEntity = await this.caseRepository.findById(caseId);
        if (!caseEntity) throw ApiError.notFound("Case not found");
    
        const lawyer = await this.userRepository.findById(lawyerId);
        if (!lawyer) throw ApiError.notFound("Lawyer not found");
    
        // Mevcut avukat id'lerini al
        const currentLawyerIds = caseEntity.lawyers.map(l => l.id);
    
        // Eğer zaten ekliyse tekrar ekleme
        if (currentLawyerIds.includes(lawyerId)) {
            return caseEntity; // Zaten ekli, tekrar eklemeye gerek yok
        }
    
        // Yeni avukat id'sini ekle
        const updatedLawyerIds = [...currentLawyerIds, lawyerId];
    
        // Tüm avukat nesnelerini bul
        const updatedLawyers = (
            await Promise.all(updatedLawyerIds.map(id => this.userRepository.findById(id)))
        ).filter((lawyer): lawyer is User => lawyer !== null);
    
        // Güncelle
        return await this.caseRepository.update(caseId, { lawyers: updatedLawyers });
    }

    async removeLawyersFromCase(caseId: number, lawyerIds: number[]) {
        // 1. Case'i ve mevcut avukatları bul
        const caseEntity = await this.caseRepository.findById(caseId);
        if (!caseEntity) throw ApiError.notFound("Case not found");

        // 2. Mevcut avukat id'lerini al
        const currentLawyerIds = caseEntity.lawyers.map(l => l.id);

        // 3. Çıkarılacak avukatların var olup olmadığını kontrol et
        const invalidLawyerIds = lawyerIds.filter(id => !currentLawyerIds.includes(id));
        if (invalidLawyerIds.length > 0) {
            throw ApiError.badRequest(`Lawyers with IDs ${invalidLawyerIds.join(', ')} are not assigned to this case`);
        }

        // 4. Belirtilen avukatları listeden çıkar
        const updatedLawyerIds = currentLawyerIds.filter(id => !lawyerIds.includes(id));

        // 5. Kalan avukat nesnelerini bul
        const updatedLawyers = (
            await Promise.all(updatedLawyerIds.map(id => this.userRepository.findById(id)))
        ).filter((lawyer): lawyer is User => lawyer !== null);

        // 6. Güncelle
        return await this.caseRepository.update(caseId, { lawyers: updatedLawyers });
    }

    async getCasesBySelf(data : CaseBySelfDto){
        if(!data.userId){
            throw ApiError.badRequest('user id required field');
        }

        if(!data.companyId){
            throw ApiError.badRequest('companyId id required field');
        }

        if(data.isOwner){
            const result = await this.caseRepository.getByCompany(data.companyId);
            return result;
        }else {
            const result = await this.caseRepository.getByLawyer(data.userId)
            return result;
        }
    }
}