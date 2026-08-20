import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtPayload } from './interfaces/jwt-payload.interface';

@ApiTags('auth')
@Controller({ path: 'auth', version: '1' })
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@Public()
	@Post('register')
	@ApiOperation({ summary: 'Create a new user along with their workspace' })
	register(@Body() dto: RegisterDto) {
		return this.authService.register(dto);
	}

	@Public()
	@Post('login')
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ summary: 'Authenticate an existing user' })
	login(@Body() dto: LoginDto) {
		return this.authService.login(dto);
	}

	@Public()
	@Post('refresh')
	@HttpCode(HttpStatus.OK)
	@ApiOperation({
		summary: 'Emit a new pair of tokens using the refresh token',
	})
	refresh(@Body() dto: RefreshTokenDto) {
		return this.authService.refresh(dto.refreshToken);
	}

	@Post('logout')
	@HttpCode(HttpStatus.NO_CONTENT)
	@ApiOperation({ summary: 'Revoke the current refresh token' })
	logout(@CurrentUser() user: JwtPayload, @Body() dto: RefreshTokenDto) {
		return this.authService.logout(user.sub, dto.refreshToken);
	}

	@Public()
	@Post('forgot-password')
	@HttpCode(HttpStatus.OK)
	@ApiOperation({
		summary: 'Send a password reset email with a link',
	})
	async forgotPassword(@Body() dto: ForgotPasswordDto) {
		await this.authService.requestPasswordReset(dto.email);
		// Always generic message, whether the email exists or not — see
		// security note in AuthService.requestPasswordReset.
		return {
			message:
				'If the email exists, you will receive a link to reset your password',
		};
	}

	@Public()
	@Post('reset-password')
	@HttpCode(HttpStatus.OK)
	@ApiOperation({
		summary: 'Reset the password using the token from the email',
	})
	async resetPassword(@Body() dto: ResetPasswordDto) {
		await this.authService.resetPassword(dto.token, dto.newPassword);
		return { message: 'Password updated successfully' };
	}

	@Public()
	@Post('verify-email')
	@HttpCode(HttpStatus.OK)
	@ApiOperation({
		summary: "Confirm the user's email using the token sent",
	})
	async verifyEmail(@Body() dto: VerifyEmailDto) {
		await this.authService.verifyEmail(dto.token);
		return { message: 'Email successfully verified' };
	}

	@Post('resend-verification')
	@HttpCode(HttpStatus.OK)
	@ApiOperation({
		summary: 'Resend the verification email to the authenticated user',
	})
	async resendVerification(@CurrentUser() user: JwtPayload) {
		await this.authService.resendVerificationEmail(user.sub);
		return { message: 'Verification email resent' };
	}
}
