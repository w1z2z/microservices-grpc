import {AppModule} from "./app.module";
import {NestFactory} from "@nestjs/core";
import {DocumentBuilder, SwaggerModule} from "@nestjs/swagger";
import {Logger, ValidationPipe} from "@nestjs/common";
import {Transport} from "@nestjs/microservices";
import * as path from "node:path";

const logger = new Logger('audit-service');

async function bootstrap() {
  const grpcUrl = process.env.AUDIT_GRPC_URL ?? '0.0.0.0:50051';
  const port = process.env.PORT ?? 5001;

  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  const config = new DocumentBuilder()
    .setTitle('Audit Service API')
    .setDescription('API для работы с логами')
    .setVersion('1.0')
    .addApiKey({ type: 'apiKey', name: 'x-api-key', in: 'header' }, 'x-api-key')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(port);
  logger.log(`HTTP server for Swagger running on http://localhost:${port}/api`);

  const grpcApp = app.connectMicroservice({
    transport: Transport.GRPC,
    options: {
      package: 'audit',
      protoPath: path.resolve(process.cwd(), 'src/proto/audit.proto'),
      url: grpcUrl,
      loader: { keepCase: true },
    },
  });

  await grpcApp.listen();
  logger.log(`gRPC server running on ${grpcUrl}`);
}

bootstrap();