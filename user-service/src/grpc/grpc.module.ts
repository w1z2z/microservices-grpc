import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { GrpcService } from './grpc.service';
import * as path from 'path';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'AUDIT_CLIENT',
        transport: Transport.GRPC,
        options: {
          package: 'audit',
          protoPath: path.resolve(process.cwd(), 'src/proto/audit.proto'),
          url: 'localhost:50051',
          loader: {
            keepCase: true,
          },
        },
      },
    ]),
  ],
  providers: [GrpcService],
  exports: [GrpcService],
})
export class GrpcModule {}