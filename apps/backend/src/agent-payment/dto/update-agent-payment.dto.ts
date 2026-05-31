import { PartialType } from '@nestjs/mapped-types';
import { UpdateAgentPaymentDto as SharedUpdateAgentPaymentDto } from '@RealEstate/types';
import { CreateAgentPaymentDto } from './create-agent-payment.dto';

export class UpdateAgentPaymentDto
  extends PartialType(CreateAgentPaymentDto)
  implements SharedUpdateAgentPaymentDto {}
