import {AppDataSource} from "../config/db";
import { Repository } from "typeorm";
import { Role } from "../entities/Role";



export class RoleRepository {
    private repository: Repository<Role>;

    constructor() {
        this.repository = AppDataSource.getRepository(Role);
    }

    async create(data: Partial<Role>): Promise<Role> {
        const role = this.repository.create(data);
        return await this.repository.save(role);
    }

    async findById(id: number): Promise<Role | null> {
        return await this.repository.findOne({
            where: { id }
        });
    }

    async getAll(): Promise<Role[]> {
        return await this.repository.find();
    }

    async update(id: number, data: Partial<Role>): Promise<Role> {
        await this.repository.update(id, data);
        const updatedRole = await this.findById(id);
        if (!updatedRole) {
            throw new Error('Role not found after update');
        }
        return updatedRole;
    }

}