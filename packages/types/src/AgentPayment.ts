export class GetAgentPaymentsParams {
  isPaid?: boolean;
  id_user?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export class CreateAgentPaymentDto {
  dueDate!: string;
  amount!: number;
  isPaid?: boolean;
  id_user!: string;
}

export class UpdateAgentPaymentDto {
  dueDate?: string;
  amount?: number;
  isPaid?: boolean;
  id_user?: string;
}
