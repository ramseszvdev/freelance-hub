import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { EnvConfig } from './config/env.validation';
import { ConfigService } from '@nestjs/config';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
	const app = await NestFactory.create(AppModule, {
		logger: ['error', 'warn', 'log'],
		// Enables req.rawBody (unparsed Buffer) on ALL requests,
		// while keeping req.body parsed as JSON as usual. We specifically
		// need this to verify Stripe webhook signatures.
		rawBody: true,
	});

	const configService = app.get(ConfigService<EnvConfig, true>);
	const port = configService.get('PORT', { infer: true });
	const frontendUrl = configService.get('FRONTEND_URL', { infer: true });
	const nodeEnv = configService.get('NODE_ENV', { infer: true });

	app.use(helmet());

	app.enableCors({
		origin: frontendUrl,
		credentials: true,
	});

	app.setGlobalPrefix('api');
	app.enableVersioning({
		type: VersioningType.URI,
		defaultVersion: '1',
	});

	app.useGlobalPipes(
		new ValidationPipe({
			whitelist: true,
			forbidNonWhitelisted: true,
			transform: true,
			transformOptions: { enableImplicitConversion: true },
		})
	);

	app.useGlobalFilters(new HttpExceptionFilter());

	if (nodeEnv !== 'production') {
		const config = new DocumentBuilder()
			.setTitle('Freelance Hub API')
			.setDescription('Project management and billing API for freelancers')
			.setVersion('1.0')
			.addBearerAuth()
			.build();
		const document = SwaggerModule.createDocument(app, config);
		SwaggerModule.setup('api/docs', app, document);
	}

	await app.listen(port);
	console.log(`🚀 API running on http://localhost:${port}/api/v1`);
	if (nodeEnv !== 'production') {
		console.log(`📚 Docs available in http://localhost:${port}/api/docs`);
	}
}

bootstrap();
