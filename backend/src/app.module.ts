import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';
import { TasksModule } from './modules/tasks/tasks.module';
import { TimeLogsModule } from './modules/time-logs/time-logs.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({ imports: [ConfigModule.forRoot({ isGlobal: true }), PrismaModule, AuthModule, TasksModule, TimeLogsModule, AnalyticsModule] })
export class AppModule {}
