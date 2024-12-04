import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { SearchModule } from './search/search.module';
import { HealthModule } from './common/health/health.module';
import { AppController } from './app.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    AuthModule,
    UserModule,
    SearchModule,
    HealthModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
