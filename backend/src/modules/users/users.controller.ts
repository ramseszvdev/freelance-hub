import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { MeResponseDto } from './dto/me-response.dto';

@ApiTags('users')
@ApiBearerAuth()
@Controller({ path: 'users', version: '1' })
export class UsersController {
	constructor(private readonly usersService: UsersService) {}

	@Get('me')
	@ApiOperation({
		summary: 'Authenticated user profile + workspace + current plan',
	})
	getMe(@CurrentUser() user: JwtPayload): Promise<MeResponseDto> {
		return this.usersService.getMe(user.sub, user.workspaceId);
	}
}
