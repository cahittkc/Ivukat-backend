import { Repository } from 'typeorm';
import { AppDataSource } from '../config/db';
import { RefreshToken } from '../entities/RefreshToken';
import { User } from '../entities/User';
import { MoreThan, LessThan } from 'typeorm';

export class RefreshTokenRepository {
    private repository: Repository<RefreshToken>;

    constructor() {
        this.repository = AppDataSource.getRepository(RefreshToken);
    }

    async create(data: Partial<RefreshToken>): Promise<RefreshToken> {
        const token = this.repository.create(data);
        return await this.repository.save(token);
    }

    async findByToken(token: string): Promise<RefreshToken | null> {
        return await this.repository.findOne({
            where: { token },
            relations: ['user']
        });
    }

    async findValidTokensByUser(user: User): Promise<RefreshToken[]> {
        return await this.repository.find({
            where: {
                user: { id: user.id },
                isValid: true,
                expiresAt: MoreThan(new Date())
            }
        });
    }

    async findValidTokenByUserId(id : number): Promise<RefreshToken | null> {
        return await this.repository.findOne({
            where: {
                user: { id },
                isValid: true,
                expiresAt: MoreThan(new Date())
            }
        });
    }

    async invalidateToken(token: string): Promise<void> {
        await this.repository.update(
            { token },
            { isValid: false }
        );
    }

    async invalidateAllUserTokens(userId: number): Promise<void> {
        await this.repository.update(
            { user: { id: userId } },
            { isValid: false }
        );
    }

    async deleteExpiredTokens(): Promise<void> {
        await this.repository.delete({
            expiresAt: LessThan(new Date())
        });
    }
} 