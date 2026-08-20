import { ApiProperty } from '@nestjs/swagger';

class WorkspaceInfoDto {
	@ApiProperty()
	id: string;

	@ApiProperty()
	name: string;

	@ApiProperty()
	slug: string;
}

class SubscriptionInfoDto {
	@ApiProperty({ enum: ['FREE', 'PRO', 'BUSINESS'] })
	plan: string;

	@ApiProperty({ enum: ['ACTIVE', 'PAST_DUE', 'CANCELLED', 'TRIALING'] })
	status: string;

	@ApiProperty({ required: false, nullable: true })
	currentPeriodEnd: Date | null;
}

export class MeResponseDto {
	@ApiProperty()
	id: string;

	@ApiProperty()
	email: string;

	@ApiProperty({ required: false, nullable: true })
	emailVerifiedAt: Date | null;

	@ApiProperty()
	firstName: string;

	@ApiProperty()
	lastName: string;

	@ApiProperty({ type: WorkspaceInfoDto })
	workspace: WorkspaceInfoDto;

	@ApiProperty({ enum: ['OWNER', 'ADMIN', 'MEMBER'] })
	role: string;

	@ApiProperty({ type: SubscriptionInfoDto })
	subscription: SubscriptionInfoDto;
}
