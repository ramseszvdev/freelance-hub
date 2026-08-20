import {
	ExceptionFilter,
	Catch,
	ArgumentsHost,
	HttpException,
	HttpStatus,
	Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

interface ErrorResponseBody {
	statusCode: number;
	timestamp: string;
	path: string;
	message: string | string[];
	error?: string;
}

/**
 * Catch ANY exception thrown in the app (HttpException or not)
 * and converts it to a predictable JSON format:
 *
 * {
 *   "statusCode": 400,
 *   "timestamp": "...",
 *   "path": "/api/v1/clients",
 *   "message": "The email is already in use" | ["error1", "error2"],
 *   "error": "Bad Request"
 * }
 *
 * This avoids that the frontend has to handle 5 different error formats.
 */
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
	private readonly logger = new Logger(HttpExceptionFilter.name);

	catch(exception: unknown, host: ArgumentsHost) {
		const ctx = host.switchToHttp();
		const response = ctx.getResponse<Response>();
		const request = ctx.getRequest<Request>();

		const isHttpException = exception instanceof HttpException;
		const status = isHttpException
			? exception.getStatus()
			: HttpStatus.INTERNAL_SERVER_ERROR;

		const exceptionResponse = isHttpException
			? exception.getResponse()
			: null;

		const message = this.extractMessage(exceptionResponse, exception);

		const body: ErrorResponseBody = {
			statusCode: status,
			timestamp: new Date().toISOString(),
			path: request.url,
			message,
			error: isHttpException ? exception.name : 'InternalServerError',
		};

		// 5xx errors do get logged with the full stack trace — the 4xx ones don't
		// "expected" (validation, auth, etc.) and they don't mess up the logs.
		if (status >= 500) {
			this.logger.error(
				`${request.method} ${request.url}`,
				exception instanceof Error ? exception.stack : String(exception)
			);
		}

		response.status(status).json(body);
	}

	private extractMessage(
		exceptionResponse: string | object | null,
		exception: unknown
	): string | string[] {
		if (typeof exceptionResponse === 'string') return exceptionResponse;

		if (
			exceptionResponse &&
			typeof exceptionResponse === 'object' &&
			'message' in exceptionResponse
		) {
			return (exceptionResponse as { message: string | string[] }).message;
		}

		return exception instanceof Error
			? exception.message
			: 'Internal server error';
	}
}
