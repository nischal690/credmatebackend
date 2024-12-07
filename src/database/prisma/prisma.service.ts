// database/prisma/prisma.service.ts
import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);
  private readonly maxRetries = 3;
  private readonly retryDelay = 5000; // 5 seconds

  constructor() {
    super({
      log: [
        { emit: 'event', level: 'query' },
        { emit: 'stdout', level: 'info' },
        { emit: 'stdout', level: 'warn' },
        { emit: 'stdout', level: 'error' },
      ],
    });
  }

  async onModuleInit() {
    let retries = 0;
    while (retries < this.maxRetries) {
      try {
        this.logger.log(`Attempting to connect to database (attempt ${retries + 1}/${this.maxRetries})`);
        await this.$connect();
        this.logger.log('Successfully connected to database');
        return;
      } catch (error) {
        retries++;
        this.logger.error(`Failed to connect to database: ${error.message}`);
        
        if (retries === this.maxRetries) {
          this.logger.error('Max retries reached. Unable to establish database connection');
          throw error;
        }
        
        this.logger.log(`Retrying in ${this.retryDelay/1000} seconds...`);
        await new Promise(resolve => setTimeout(resolve, this.retryDelay));
      }
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}