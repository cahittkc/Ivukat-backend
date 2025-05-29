import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { Case } from "./Case";



@Entity()
export class CaseType {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @OneToMany(() => Case, (caseEntity: Case) => caseEntity.type)
  cases: Case[]
}