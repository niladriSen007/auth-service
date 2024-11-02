import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { Roles } from './enum/Roles';

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number;
    @Column()
    firstName: string;
    @Column()
    lastName: string;
    @Column({ unique: true })
    email: string;
    @Column()
    password: string;
    @Column({ type: 'enum', enum: Roles, default: [Roles.CUSTOMER] })
    roles: Roles[];
}
