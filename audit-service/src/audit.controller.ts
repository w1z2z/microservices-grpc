import {Controller, Logger, HttpException, HttpStatus, Get, Query, UseGuards, ValidationPipe} from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { AuditService } from './audit.service';
import {ApiOperation, ApiResponse, ApiSecurity, ApiTags} from "@nestjs/swagger";
import {FindLogsDto} from "./dto";
import {ApiKeyGuard} from "./guards/api-key-auth.guard";

@ApiTags('Audit')
@ApiSecurity('x-api-key')
@Controller('audit')
export class AuditController {
  private readonly logger = new Logger(AuditController.name);

  constructor(private readonly auditService: AuditService) {}

  @GrpcMethod('AuditService', 'LogEvent')
  async logEvent(data: { action?: string; entity_type?: number; entity_id?: string; request_id?: string; timestamp?: string }) {
    try {
      if (!data.action) throw new HttpException('action required', HttpStatus.BAD_REQUEST);
      if (data.entity_type == null) throw new HttpException('entity_type required', HttpStatus.BAD_REQUEST);
      if (!data.entity_id) throw new HttpException('entity_id required', HttpStatus.BAD_REQUEST);

      await this.auditService.logEvent({
        action: data.action,
        entity_type: data.entity_type,
        entity_id: data.entity_id,
        request_id: data.request_id,
        timestamp: data.timestamp,
      });

      this.logger.log(`Event logged: ${JSON.stringify(data)}`);
      return { success: true };
    } catch (err: any) {
      this.logger.error('AuditController error', err.stack || err);
      if (err instanceof HttpException) throw err;
      throw new HttpException('AuditController error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @GrpcMethod('AuditService', 'Ping')
  async ping() {
    return { success: true };
  }

  @UseGuards(ApiKeyGuard)
  @Get('logs')
  @ApiOperation({ summary: 'Просмотр логов аудита с фильтрацией и пагинацией' })
  @ApiResponse({ status: 200, description: 'Список логов' })
  async getLogs(@Query() query: FindLogsDto) {
    return this.auditService.findLogs(query);
  }
}