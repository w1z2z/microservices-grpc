import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { AuditLog } from '../audit-log.model';
import { AuditService } from './audit.service';
import { AuditController } from './audit.controller';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    SequelizeModule.forRoot({
      dialect: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5433,
      username: process.env.DB_USER || 'audit',
      password: process.env.DB_PASSWORD || 'auditpass',
      database: process.env.DB_NAME || 'audit_db',
      models: [AuditLog],
      autoLoadModels: true,
      synchronize: false,
      logging: true,
    }),
    SequelizeModule.forFeature([AuditLog]),
  ],
  controllers: [AuditController],
  providers: [AuditService],
})
export class AppModule {}