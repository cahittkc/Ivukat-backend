import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToOne, JoinColumn, ManyToMany } from "typeorm";
import { IsBoolean, IsEmail } from "class-validator";
import { Role } from "./Role";
import { RefreshToken } from "./RefreshToken";
import { Company } from "./Company";
import { Case } from "./Case";



@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, length: 100 })
  username: string;

  @Column()
  firstName: string;

  @Column({ nullable: true })
  middleName: string;

  @Column()
  lastName: string;

  @Column({ unique: true })
  @IsEmail()
  email: string;

  @Column()
  password: string;

  @Column({ default: false })
  @IsBoolean()
  isVerified: boolean;

  @ManyToOne(() => Role, role => role.users, { eager: true })
  @JoinColumn({ name: "roleId" })
  role: Role;

  @ManyToOne(() => Company, company => company.users, {
    nullable: false,
    eager: true,
  })
  @JoinColumn({ name: 'companyId' })
  company: Company;

  @Column({ default: false })
  @IsBoolean()
  isOwner: boolean;

  @ManyToMany(() => Case, caseEntity => caseEntity.lawyers)
  cases: Case[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => RefreshToken, token => token.user)
  refreshTokens: RefreshToken[];
}