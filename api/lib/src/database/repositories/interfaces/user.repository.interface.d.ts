import { User } from '@prisma/client';
import { IBaseRepository } from '../base.repository';
export interface IUserRepository extends IBaseRepository<User> {
    findByEmail(email: string): Promise<User | null>;
    findByPhoneNumber(phoneNumber: string): Promise<User | null>;
}
