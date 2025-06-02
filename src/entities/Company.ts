import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToOne, JoinColumn } from "typeorm";
import { IsBoolean, IsEmail } from "class-validator";
import { User } from "./User";
import { Case } from "./Case";



@Entity()
export class Company {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, length: 100 })
  name: string;

  @Column({ length: 255, nullable: true })
  address: string;

  @Column({  nullable: true })
  phoneNumber: string;

  @Column({ unique: true })
  @IsEmail()
  email: string;

  @OneToMany(() => Case, caseEntity => caseEntity.company)
  cases: Case[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => User, user => user.company)
  users: User[];
}