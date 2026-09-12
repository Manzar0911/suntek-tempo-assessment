import { Module } from '@nestjs/common';
import { TimeLogMutationsController } from './time-log-mutations.controller';
import { TimeLogMutationsService } from './time-log-mutations.service';
import { TimeLogsController } from './time-logs.controller';
import { TimeLogsRepository } from './time-logs.repository';
import { TimeLogsService } from './time-logs.service';
@Module({ controllers: [TimeLogsController, TimeLogMutationsController], providers: [TimeLogsService, TimeLogsRepository, TimeLogMutationsService] })
export class TimeLogsModule {}
