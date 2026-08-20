import {
	Body,
	Controller,
	Delete,
	Get,
	HttpCode,
	HttpStatus,
	Param,
	Patch,
	Post,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ClientsService } from './clients.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { LimitResource } from '../billing/decorators/limit-resource.decorator';

@ApiTags('clients')
@ApiBearerAuth()
@Controller({ path: 'clients', version: '1' })
export class ClientsController {
	constructor(private readonly clientsService: ClientsService) {}

	@Post()
	@LimitResource('clients')
	@ApiOperation({ summary: 'Create a client in the current workspace' })
	create(@CurrentUser() user: JwtPayload, @Body() dto: CreateClientDto) {
		return this.clientsService.create(user.workspaceId, dto);
	}

	@Get()
	@ApiOperation({ summary: 'List all the clients in the current workspace' })
	findAll(@CurrentUser() user: JwtPayload) {
		return this.clientsService.findAll(user.workspaceId);
	}

	@Get(':id')
	@ApiOperation({ summary: 'Gets a client by id' })
	findOne(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
		return this.clientsService.findOne(user.workspaceId, id);
	}

	@Patch(':id')
	@ApiOperation({ summary: 'Update a client' })
	update(
		@CurrentUser() user: JwtPayload,
		@Param('id') id: string,
		@Body() dto: UpdateClientDto
	) {
		return this.clientsService.update(user.workspaceId, id, dto);
	}

	@Delete(':id')
	@HttpCode(HttpStatus.NO_CONTENT)
	@ApiOperation({ summary: 'Delete a client' })
	remove(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
		return this.clientsService.remove(user.workspaceId, id);
	}
}
