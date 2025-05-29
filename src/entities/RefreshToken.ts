import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from './User';

@Entity()
export class RefreshToken {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'text', unique: true })
    token: string;

    @Column({ type: 'boolean', default: true })
    isValid: boolean;

    @Column({ type: 'timestamp' })
    expiresAt: Date;

    @Column({ type: 'varchar', nullable: true })
    deviceInfo?: string;

    @Column({ type: 'varchar', nullable: true })
    ipAddress?: string;

    @ManyToOne(() => User, user => user.refreshTokens, { onDelete: 'CASCADE' })
    user: User;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
} 