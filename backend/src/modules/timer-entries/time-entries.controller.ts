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
	Query,
} from '@nestjs/common';
import {
	ApiBearerAuth,
	ApiOperation,
	ApiQuery,
	ApiTags,
} from '@nestjs/swagger';
import { TimeEntriesService } from './time-entries.service';
import { StartTimerDto } from './dto/start-timer.dto';
import { CreateManualEntryDto } from './dto/create-manual-entry.dto';
import { UpdateTimeEntryDto } from './dto/update-time-entry.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';

@ApiTags('time-entries')
@ApiBearerAuth()
@Controller({ path: 'time-entries', version: '1' })
export class TimeEntriesController {
	constructor(private readonly timeEntriesService: TimeEntriesService) {}

	@Post('start')
	@ApiOperation({ summary: 'Start a timer for a project' })
	startTimer(@CurrentUser() user: JwtPayload, @Body() dto: StartTimerDto) {
		return this.timeEntriesService.startTimer(user.workspaceId, dto);
	}

	@Patch(':id/stop')
	@ApiOperation({ summary: 'Stops a running timer' })
	stopTimer(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
		return this.timeEntriesService.stopTimer(user.workspaceId, id);
	}

	@Post('manual')
	@ApiOperation({
		summary: 'Create a manual time log (without using the timer)',
	})
	createManual(
		@CurrentUser() user: JwtPayload,
		@Body() dto: CreateManualEntryDto
	) {
		return this.timeEntriesService.createManual(user.workspaceId, dto);
	}

	@Get()
	@ApiOperation({ summary: 'List the workspace time entries' })
	@ApiQuery({ name: 'projectId', required: false })
	findAll(
		@CurrentUser() user: JwtPayload,
		@Query('projectId') projectId?: string
	) {
		return this.timeEntriesService.findAll(user.workspaceId, projectId);
	}

	@Get(':id')
	@ApiOperation({ summary: 'Gets a time record by id' })
	findOne(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
		return this.timeEntriesService.findOne(user.workspaceId, id);
	}

	@Patch(':id')
	@ApiOperation({ summary: 'Update a time record' })
	update(
		@CurrentUser() user: JwtPayload,
		@Param('id') id: string,
		@Body() dto: UpdateTimeEntryDto
	) {
		return this.timeEntriesService.update(user.workspaceId, id, dto);
	}

	@Delete(':id')
	@HttpCode(HttpStatus.NO_CONTENT)
	@ApiOperation({ summary: 'Delete a time entry' })
	remove(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
		return this.timeEntriesService.remove(user.workspaceId, id);
	}
}
