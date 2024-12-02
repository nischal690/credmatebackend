import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { IUserRepository } from './interfaces/user.repository.interface';
import type { User, Prisma } from '@prisma/client';

@Injectable()
export class UserRepository implements IUserRepository {
  constructor(private prisma: PrismaService) {}

  async create(data: Partial<User>): Promise<User> {
    return this.prisma.user.create({ 
      data: data as Prisma.UserCreateInput 
    });
  }

  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async findOne(filter: Partial<User>): Promise<User | null> {
    return this.prisma.user.findFirst({ 
      where: filter as Prisma.UserWhereInput 
    });
  }

  async findMany(filter: Partial<User>): Promise<User[]> {
    return this.prisma.user.findMany({ 
      where: filter as Prisma.UserWhereInput 
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async findByPhoneNumber(phoneNumber: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { phoneNumber } });
  }

  async update(id: string, data: Partial<User>): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data: data as Prisma.UserUpdateInput
    });
  }

  async delete(id: string): Promise<User> {
    return this.prisma.user.delete({ where: { id } });
  }
}