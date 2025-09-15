import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import {SequelizeModule} from "@nestjs/sequelize";
import {GrpcModule} from "../grpc/grpc.module";

@Module({
  imports: [SequelizeModule.forFeature([]), GrpcModule],
  controllers: [HealthController],
})
export class HealthModule {}
