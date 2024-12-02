import { PrismaService } from '../../database/prisma/prisma.service';

export abstract class BaseService {
  constructor(protected readonly prismaService: PrismaService) {}

  protected async findOne<T extends keyof PrismaService>(
    model: T,
    where: any,
    select?: any,
  ) {
    return (this.prismaService[model] as any).findUnique({
      where,
      select,
    });
  }

  protected async upsert<T extends keyof PrismaService>(
    model: T,
    where: any,
    create: any,
    update: any,
  ) {
    return (this.prismaService[model] as any).upsert({
      where,
      create,
      update,
    });
  }

  protected async update<T extends keyof PrismaService>(
    model: T,
    where: any,
    data: any,
    select?: any,
  ) {
    return (this.prismaService[model] as any).update({
      where,
      data,
      select,
    });
  }
}
