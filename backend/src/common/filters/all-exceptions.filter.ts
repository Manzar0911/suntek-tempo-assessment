import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';

function readable(value: unknown, fallback: string): string {
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) return value.filter((item): item is string => typeof item === 'string').join(', ');
  return fallback;
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<Response>();
    const request = host.switchToHttp().getRequest<Request>();
    const status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    const body = exception instanceof HttpException ? exception.getResponse() : null;
    const objectBody = typeof body === 'object' && body !== null ? body as Record<string, unknown> : {};
    const fallback = exception instanceof Error ? exception.message : 'Unexpected error';
    const message = status === 500 ? 'Something went wrong. Please try again.' : readable(objectBody.message, fallback);
    const statusName = typeof HttpStatus[status] === 'string' ? HttpStatus[status] : 'ERROR';
    const code = readable(objectBody.error, statusName).toUpperCase().replaceAll(' ', '_');
    response.status(status).json({ success: false, error: { code, message, path: request.url, timestamp: new Date().toISOString() } });
  }
}
