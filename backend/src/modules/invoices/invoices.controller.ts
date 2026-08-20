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
import { InvoicesService } from './invoices.service';
import { GenerateFromProjectDto } from './dto/generate-from-project.dto';
import { CreateManualInvoiceDto } from './dto/create-manual-invoice.dto';
import { UpdateInvoiceStatusDto } from './dto/update-invoice-status.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';

@ApiTags('invoices')
@ApiBearerAuth()
@Controller({ path: 'invoices', version: '1' })
export class InvoicesController {
	constructor(private readonly invoicesService: InvoicesService) {}

	@Post('generate-from-project')
	@ApiOperation({
		summary: 'Generate an invoice from the unbilled hours of a project',
	})
	generateFromProject(
		@CurrentUser() user: JwtPayload,
		@Body() dto: GenerateFromProjectDto
	) {
		return this.invoicesService.generateFromProject(user.workspaceId, dto);
	}

	@Post('manual')
	@ApiOperation({ summary: 'Create an invoice with manual items' })
	createManual(
		@CurrentUser() user: JwtPayload,
		@Body() dto: CreateManualInvoiceDto
	) {
		return this.invoicesService.createManual(user.workspaceId, dto);
	}

	@Get()
	@ApiOperation({ summary: 'List the workspace invoices' })
	@ApiQuery({ name: 'status', required: false })
	findAll(@CurrentUser() user: JwtPayload, @Query('status') status?: string) {
		return this.invoicesService.findAll(user.workspaceId, status);
	}

	@Get(':id')
	@ApiOperation({ summary: 'Gets an invoice by ID, with its items' })
	findOne(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
		return this.invoicesService.findOne(user.workspaceId, id);
	}

	@Patch(':id/status')
	@ApiOperation({
		summary: 'Update the status of an invoice (e.g., mark as paid)',
	})
	updateStatus(
		@CurrentUser() user: JwtPayload,
		@Param('id') id: string,
		@Body() dto: UpdateInvoiceStatusDto
	) {
		return this.invoicesService.updateStatus(user.workspaceId, id, dto);
	}

	@Delete(':id')
	@HttpCode(HttpStatus.NO_CONTENT)
	@ApiOperation({ summary: 'Delete an invoice (only if it is in DRAFT)' })
	remove(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
		return this.invoicesService.remove(user.workspaceId, id);
	}
}
