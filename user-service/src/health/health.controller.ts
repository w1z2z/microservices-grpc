import {Controller, Get, Logger, UseGuards} from '@nestjs/common';
import { Sequelize } from 'sequelize-typescript';
import { GrpcService } from '../grpc/grpc.service';
import {ApiTags, ApiOperation, ApiResponse, ApiSecurity} from '@nestjs/swagger';
import {ApiKeyGuard} from "../user/guards/api-key-auth.guard";

interface HealthCheckResult {
  db?: string;
  grpc?: string;
  timestamp: string;
}

@UseGuards(ApiKeyGuard)
@ApiTags('Health')
@ApiSecurity('x-api-key')
@Controller('health')
export class HealthController {
  private readonly logger = new Logger(HealthController.name);

  constructor(
    private readonly sequelize: Sequelize,
    private readonly grpcService: GrpcService,
  ) {}

  @Get('live')
  @ApiOperation({ summary: 'Проверка живости сервиса (live)' })
  @ApiResponse({ status: 200, description: 'Сервис жив', schema: { example: { timestamp: '2025-09-15T19:23:00.985Z', status: 'ok' } } })
  live() {
    return { timestamp: new Date().toISOString(), status: 'ok' };
  }

  @Get('ready')
  @ApiOperation({ summary: 'Проверка готовности сервиса (ready)' })
  @ApiResponse({ status: 200, description: 'Статус сервиса', schema: { example: { timestamp: '2025-09-15T19:23:00.985Z', db: 'ok', grpc: 'ok' } } })
  async ready() {
    const result: HealthCheckResult = { timestamp: new Date().toISOString() };

    try {
      await this.sequelize.authenticate();
      result.db = 'ok';
    } catch (err: any) {
      this.logger.error('Ошибка подключения к БД', err.stack || err);
      result.db = 'error';
    }

    try {
      const grpcOk = await this.grpcService.pingAudit();
      result.grpc = grpcOk ? 'ok' : 'error';
    } catch (err: any) {
      this.logger.error('Ошибка подключения к gRPC AuditService', err.stack || err);
      result.grpc = 'error';
    }

    return result;
  }
}