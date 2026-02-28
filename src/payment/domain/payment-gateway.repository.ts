import { MerchantResponse } from '../dto/merchant-response.dto';
import { CreateCardTokenDto } from '../dto/create-card-token.dto';
import { CardTokenResponse } from '../dto/card-token-response.dto';
import { CreateTransactionResponse } from '../dto/create-transaction-response.dto';

export interface CreateTransactionPayload {
  acceptance_token: string;
  amount_in_cents: number;
  currency: string;
  customer_email: string;
  payment_method: {
    type: string;
    installments: number;
    token: string;
  };
  reference: string;
  signature: string;
  customer_data: {
    full_name: string;
    phone_number: string;
    legal_id: string;
    legal_id_type: string;
  };
  redirect_url?: string;
}

export interface PaymentGatewayRepository {
  generateReference(): string;
  generateSignature(
    reference: string,
    amountInCents: number,
    currency: string,
  ): string;
  getMerchantInfo(): Promise<MerchantResponse>;
  createCardToken(body: CreateCardTokenDto): Promise<CardTokenResponse>;
  createTransaction(
    payload: CreateTransactionPayload,
  ): Promise<CreateTransactionResponse>;
  getTransaction(id: string): Promise<CreateTransactionResponse>;
}

export const PAYMENT_GATEWAY = 'PAYMENT_GATEWAY';
