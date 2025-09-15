import { Injectable, Inject, OnModuleInit, Logger } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom, Observable } from 'rxjs';

export interface AuditEvent {
  action: string;
  entity_type: number;
  entity_id: string;
  request_id: string;
  timestamp: string;
}

interface PingResponse {
  success: boolean;
}

interface AuditResponse {
  success: boolean;
}

interface AuditGrpcService {
  LogEvent(event: AuditEvent): Observable<AuditResponse>;
  Ping(request: {}): Observable<PingResponse>;
}

@Injectable()
export class GrpcService implements OnModuleInit {
  private readonly logger = new Logger(GrpcService.name);
  private auditService: AuditGrpcService;

  constructor(@Inject('AUDIT_CLIENT') private readonly client: ClientGrpc) {}

  onModuleInit() {
    this.auditService = this.client.getService<AuditGrpcService>('AuditService');
  }

  async sendAudit(data: AuditEvent) {
    if (!this.auditService) return;
    try {
      return await firstValueFrom(this.auditService.LogEvent(data));
    } catch (err: any) {
      this.logger.warn(`Не удалось отправить событие в gRPC AuditService: ${err.message}`);
      return null;
    }
  }

  async pingAudit(): Promise<boolean> {
    try {
      const res = await firstValueFrom(this.auditService.Ping({}));
      return res?.success === true;
    } catch (err: any) {
      this.logger.warn(`AuditService недоступен: ${err.message}`);
      return false;
    }
  }
}