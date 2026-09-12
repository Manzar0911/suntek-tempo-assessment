import { ValidationPipe, VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(helmet());
  app.use(cookieParser());
  app.enableCors({ origin: process.env.FRONTEND_URL ?? 'http://localhost:5173', credentials: true, methods: ['GET', 'POST', 'PATCH', 'DELETE'] });
  app.setGlobalPrefix('api');
  app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalInterceptors(new ResponseInterceptor());
  const config = new DocumentBuilder()
    .setTitle('Tempo Task & Time API')
    .setDescription('Secure REST API for tasks, real-time timers, reminders, time logs, and daily/weekly productivity analytics.')
    .setVersion('1.1')
    .addCookieAuth('tempo_session', { type: 'apiKey', in: 'cookie' }, 'session-cookie')
    .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' })
    .addTag('Authentication').addTag('Tasks').addTag('Time logs').addTag('Analytics').build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document, { customSiteTitle: 'Tempo API Docs', swaggerOptions: { persistAuthorization: true } });
  await app.listen(process.env.PORT ?? 3000);
}

void bootstrap();
