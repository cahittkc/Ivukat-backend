import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToMany, JoinTable, ManyToOne, JoinColumn } from "typeorm";
import { User } from "./User";
import { Company } from "./Company";
import { CaseType } from "./CaseType";

@Entity()
export class Case {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ nullable: true })
  description: string;

  @ManyToOne(() => Company, company => company.cases, { nullable: false, eager: false })
  @JoinColumn({ name: "companyId" })
  company: Company;

  @ManyToOne(() => CaseType, type => type.cases, { eager: false, nullable: false })
  @JoinColumn({ name: "typeId" })
  type: CaseType;

  @ManyToMany(() => User, user => user.cases, { eager: false })
  @JoinTable({
    name: "case_lawyers",
    joinColumn: { name: "caseId", referencedColumnName: "id" },
    inverseJoinColumn: { name: "userId", referencedColumnName: "id" }
  })
  lawyers: User[];

  @Column({ default: true, nullable: false })
  active: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}