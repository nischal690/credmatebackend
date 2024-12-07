import { PrismaService } from '../../database/prisma/prisma.service';
export declare abstract class BaseService {
    protected readonly prismaService: PrismaService;
    constructor(prismaService: PrismaService);
    protected findOne<T extends keyof PrismaService>(model: T, where: any, select?: any): Promise<any>;
    protected upsert<T extends keyof PrismaService>(model: T, where: any, create: any, update: any): Promise<any>;
    protected update<T extends keyof PrismaService>(model: T, where: any, data: any, select?: any): Promise<any>;
}
