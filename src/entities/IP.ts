import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  BaseEntity,
} from 'typeorm';

@Entity()
export class Ip extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  ip!: string;

  @Column({ nullable: true })
  timezone: string;

  @Column({ nullable: true })
  city: string;

  @Column({ nullable: true })
  country: string;

  @Column({ nullable: true })
  coordinates: string;

  @CreateDateColumn()
  createdAt: Date;
}
