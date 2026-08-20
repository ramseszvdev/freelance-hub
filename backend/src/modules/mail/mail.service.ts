import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import { EnvConfig } from '../../config/env.validation';

@Injectable()
export class MailService {
	private readonly logger = new Logger(MailService.name);
	private readonly resend: Resend;
	private readonly fromAddress: string;
	private readonly frontendUrl: string;

	constructor(private readonly configService: ConfigService<EnvConfig, true>) {
		this.resend = new Resend(
			this.configService.get('RESEND_API_KEY', { infer: true })
		);
		this.fromAddress = this.configService.get('EMAIL_FROM', { infer: true });
		this.frontendUrl = this.configService.get('FRONTEND_URL', {
			infer: true,
		});
	}

	async sendVerificationEmail(to: string, firstName: string, token: string) {
		const link = `${this.frontendUrl}/verify-email?token=${token}`;

		const { error } = await this.resend.emails.send({
			from: this.fromAddress,
			to,
			subject: 'Confirm your email — Freelance Hub',
			html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
          <h2>Hello ${firstName} 👋</h2>
          <p>Thanks for signing up at Freelance Hub. Confirm your email to activate your account:</p>
          <p style="margin: 24px 0;">
            <a href="${link}" style="background:#14201a;color:#f2f4ec;padding:12px 20px;border-radius:6px;text-decoration:none;">
              Confirm my email
            </a>
          </p>
          <p style="color:#666;font-size:13px;">If you did not create this account, just ignore this email.</p>
        </div>
      `,
		});

		if (error) {
			// We don't throw an error: if the email fails, we don't want the
			// whole registration to fail — the user can request a resend.
			this.logger.error(
				`Error sending verification email to ${to}: ${error.message}`
			);
		}
	}

	async sendPasswordResetEmail(to: string, firstName: string, token: string) {
		const link = `${this.frontendUrl}/reset-password?token=${token}`;

		const { error } = await this.resend.emails.send({
			from: this.fromAddress,
			to,
			subject: 'Recover your password — Freelance Hub',
			html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
          <h2>Hola ${firstName}</h2>
          <p>We received a request to reset your password. This link expires in 1 hour:</p>
          <p style="margin: 24px 0;">
            <a href="${link}" style="background:#14201a;color:#f2f4ec;padding:12px 20px;border-radius:6px;text-decoration:none;">
              Reset password
            </a>
          </p>
          <p style="color:#666;font-size:13px;">If you did not request this, just ignore this email — your password will not change.</p>
        </div>
      `,
		});

		if (error) {
			this.logger.error(
				`Error sending reset email to ${to}: ${error.message}`
			);
		}
	}

	async sendPasswordChangedEmail(to: string, firstName: string) {
		const { error } = await this.resend.emails.send({
			from: this.fromAddress,
			to,
			subject: 'Your password has been updated — Freelance Hub',
			html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
          <h2>Hola ${firstName}</h2>
          <p>Your Freelance Hub password was updated successfully.</p>
          <p style="color:#666;font-size:13px;">
            If you were not the one who made this change, contact support immediately — someone else might have access to your account.
          </p>
        </div>
      `,
		});

		if (error) {
			this.logger.error(
				`Error sending password changed email to ${to}: ${error.message}`
			);
		}
	}

	async sendEmailVerifiedConfirmation(to: string, firstName: string) {
		const { error } = await this.resend.emails.send({
			from: this.fromAddress,
			to,
			subject: 'Email confirmed — Freelance Hub',
			html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
          <h2>¡Ready, ${firstName}! ✅</h2>
          <p>Your email has been successfully confirmed. You now have full access to your account.</p>
        </div>
      `,
		});

		if (error) {
			this.logger.error(
				`Error sending verified email confirmation to ${to}: ${error.message}`
			);
		}
	}
}
