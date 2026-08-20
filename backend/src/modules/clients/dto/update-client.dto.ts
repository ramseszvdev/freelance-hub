import { PartialType } from '@nestjs/swagger';
import { CreateClientDto } from './create-client.dto';

/**
 * PartialType takes CreateClientDto and makes all its fields optional,
 * reusing the same validations (if you send `email`, it still validates
 * as an email; it's just not mandatory to send it in an update).
 */
export class UpdateClientDto extends PartialType(CreateClientDto) {}
