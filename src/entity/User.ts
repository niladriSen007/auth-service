import {
    Column,
    CreateDateColumn,
    Entity,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { Roles } from './enum/Roles';
import { Tenant } from './Tenant';
import { RefreshToken } from './RefreshToken';

@Entity({ name: 'users' })
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
    @ManyToOne(() => Tenant)
    tenant: Tenant | null;

    @OneToMany(() => RefreshToken, (refreshToken) => refreshToken.user)
    refreshTokens: RefreshToken[];

    @UpdateDateColumn()
    updatedAt: Date;

    @CreateDateColumn()
    createdAt: Date;
}
