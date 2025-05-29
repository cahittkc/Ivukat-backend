import {Entity, Column, PrimaryGeneratedColumn , OneToMany , CreateDateColumn , UpdateDateColumn} from 'typeorm';
import { IsString } from 'class-validator';
import { User } from './User';



@Entity()
export class Role {
@PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true , nullable: false})
  @IsString()
  name: string; // e.g., 'admin', 'user', 'moderator'

  @Column()
  @IsString()
  description: string;

  @Column({ default: 0 })
  priority: number;
  
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;// Daha yüksek sayı = daha fazla yetki gibi düşünebilirsin

  @OneToMany(() => User, user => user.role)
  users: User[];
}