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
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { LimitResource } from '../billing/decorators/limit-resource.decorator';

@ApiTags('projects')
@ApiBearerAuth()
@Controller({ path: 'projects', version: '1' })
export class ProjectsController {
	constructor(private readonly projectsService: ProjectsService) {}

	@Post()
	@LimitResource('projects')
	@ApiOperation({ summary: 'Create a project in the current workspace' })
	create(@CurrentUser() user: JwtPayload, @Body() dto: CreateProjectDto) {
		return this.projectsService.create(user.workspaceId, dto);
	}

	@Get()
	@ApiOperation({ summary: 'List all the projects in the current workspace' })
	findAll(@CurrentUser() user: JwtPayload) {
		return this.projectsService.findAll(user.workspaceId);
	}

	@Get(':id')
	@ApiOperation({ summary: 'Gets a project by id' })
	findOne(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
		return this.projectsService.findOne(user.workspaceId, id);
	}

	@Patch(':id')
	@ApiOperation({ summary: 'Update a project' })
	update(
		@CurrentUser() user: JwtPayload,
		@Param('id') id: string,
		@Body() dto: UpdateProjectDto
	) {
		return this.projectsService.update(user.workspaceId, id, dto);
	}

	@Delete(':id')
	@HttpCode(HttpStatus.NO_CONTENT)
	@ApiOperation({ summary: 'Delete a project' })
	remove(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
		return this.projectsService.remove(user.workspaceId, id);
	}
}
