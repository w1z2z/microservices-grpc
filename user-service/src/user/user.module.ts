import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { User } from '../../models/user.model';
import { GrpcModule } from '../grpc/grpc.module';

@Module({
  imports: [SequelizeModule.forFeature([User]), GrpcModule],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}