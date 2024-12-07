import { PrismaService } from '../prisma/prisma.service';
import { IUserRepository } from './interfaces/user.repository.interface';
import type { User } from '@prisma/client';
export declare class UserRepository implements IUserRepository {
    private prisma;
    constructor(prisma: PrismaService);
    create(data: Partial<User>): Promise<User>;
    findById(id: string): Promise<User | null>;
    findOne(filter: Partial<User>): Promise<User | null>;
    findMany(filter: Partial<User>): Promise<User[]>;
    findByEmail(email: string): Promise<User | null>;
    findByPhoneNumber(phoneNumber: string): Promise<User | null>;
    update(id: string, data: Partial<User>): Promise<User>;
    delete(id: string): Promise<User>;
}
