import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import * as crypto from 'crypto';
import {
  PaymentGatewayRepository,
  CreateTransactionPayload,
} from '../../domain/payment-gateway.repository';
import { MerchantResponse } from '../../dto/merchant-response.dto';
import { CreateCardTokenDto } from '../../dto/create-card-token.dto';
import { CardTokenResponse } from '../../dto/card-token-response.dto';
import { CreateTransactionResponse } from '../../dto/create-transaction-response.dto';

@Injectable()
export class WompiPaymentAdapter implements PaymentGatewayRepository {
  private readonly baseUrl: string;
  private readonly publicKey: string;
  private readonly integritySecret: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.baseUrl = this.configService.get<string>('BASE_URL')!;
    this.publicKey = this.configService.get<string>('PUBLIC_KEY')!;
    this.integritySecret = this.configService.get<string>('INTEGRITY_SECRET')!;
  }

  generateReference(): string {
    return `ORDER-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
  }

  generateSignature(
    reference: string,
    amountInCents: number,
    currency: string,
  ): string {
    const chain = `${reference}${amountInCents}${currency}${this.integritySecret}`;
    return crypto.createHash('sha256').update(chain).digest('hex');
  }

  private get authHeaders() {
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.publicKey}`,
    };
  }

  async getMerchantInfo(): Promise<MerchantResponse> {
    const { data } = await firstValueFrom(
      this.httpService.get<MerchantResponse>(
        `${this.baseUrl}/merchants/${this.publicKey}`,
      ),
    );
    return data;
  }

  async createCardToken(body: CreateCardTokenDto): Promise<CardTokenResponse> {
    const { data } = await firstValueFrom(
      this.httpService.post<CardTokenResponse>(
        `${this.baseUrl}/tokens/cards`,
        body,
        { headers: this.authHeaders },
      ),
    );
    return data;
  }

  async createTransaction(
    payload: CreateTransactionPayload,
  ): Promise<CreateTransactionResponse> {
    const { data } = await firstValueFrom(
      this.httpService.post<CreateTransactionResponse>(
        `${this.baseUrl}/transactions`,
        payload,
        { headers: this.authHeaders },
      ),
    );
    return data;
  }

  async getTransaction(id: string): Promise<CreateTransactionResponse> {
    const { data } = await firstValueFrom(
      this.httpService.get<CreateTransactionResponse>(
        `${this.baseUrl}/transactions/${id}`,
        { headers: this.authHeaders },
      ),
    );
    return data;
  }
}
