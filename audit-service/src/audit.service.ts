import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { v4 as uuidv4 } from 'uuid';
import { AuditLog } from '../audit-log.model';
import {FindLogsDto} from "./dto";
import {Op} from "sequelize";

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(@InjectModel(AuditLog) private auditModel: typeof AuditLog) {}

  async logEvent(data: {
    action: string;
    entity_type: number;
    entity_id: string;
    request_id?: string;
    timestamp?: string;
  }) {
    try {
      return await this.auditModel.create({
        action: String(data.action),
        entity_type: Number(data.entity_type),
        entity_id: String(data.entity_id),
        request_id: data.request_id || uuidv4(),
        timestamp: data.timestamp ? new Date(data.timestamp) : new Date(),
      });
    } catch (err: any) {
      this.logger.error('Ошибка записи события аудита', err.stack || err);
      throw new HttpException('Не удалось записать событие аудита', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async findLogs(query: FindLogsDto) {
    const { page = 1, limit = 10, entity_type, action, from, to } = query;
    const offset = (page - 1) * limit;

    const where: any = {};
    if (entity_type != null) where.entity_type = entity_type;
    if (action) where.action = { [Op.iLike]: `%${action}%` };
    if (from || to) where.timestamp = {};
    if (from) where.timestamp[Op.gte] = new Date(from);
    if (to) where.timestamp[Op.lte] = new Date(to);

    const result = await this.auditModel.findAndCountAll({
      where,
      limit,
      offset,
      order: [['timestamp', 'DESC']],
    });

    return {
      count: result.count,
      rows: result.rows,
    };
  }
}