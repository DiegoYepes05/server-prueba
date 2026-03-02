import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma.service';
import { TransactionStatus } from '@prisma/client';
import {
  Transaction,
  TransactionRepository,
} from '../../domain/transaction.repository';

@Injectable()
export class PrismaTransactionRepository implements TransactionRepository {
  constructor(private readonly prisma: PrismaService) {}

  private toEntity(record: any): Transaction {
    return {
      id: record.id,
      wompiId: record.wompiId ?? undefined,
      reference: record.reference,
      amountInCents: record.amountInCents,
      currency: record.currency,
      status: record.status.toString(),
      installments: record.installments,
      productId: record.productId,
      userId: record.userId,
      shippingAddress: record.shippingAddress ?? undefined,
      shippingCity: record.shippingCity ?? undefined,
      shippingDepartment: record.shippingDepartment ?? undefined,
    };
  }

  async create(data: Omit<Transaction, 'id'>): Promise<Transaction> {
    const record = await this.prisma.transaction.create({
      data: {
        reference: data.reference,
        amountInCents: data.amountInCents,
        currency: data.currency,
        status: data.status as TransactionStatus,
        installments: data.installments,
        productId: data.productId,
        userId: data.userId,
        shippingAddress: data.shippingAddress,
        shippingCity: data.shippingCity,
        shippingDepartment: data.shippingDepartment,
      },
    });
    return this.toEntity(record);
  }

  async updateStatus(
    id: string,
    status: string,
    wompiId?: string,
  ): Promise<Transaction> {
    const record = await this.prisma.transaction.update({
      where: { id },
      data: {
        status: status as TransactionStatus,
        wompiId,
      },
    });
    return this.toEntity(record);
  }

  async findById(id: string): Promise<Transaction | null> {
    const record = await this.prisma.transaction.findUnique({
      where: { id },
    });
    if (!record) return null;
    return this.toEntity(record);
  }

  async findByWompiId(wompiId: string): Promise<Transaction | null> {
    const record = await this.prisma.transaction.findUnique({
      where: { wompiId },
    });
    if (!record) return null;
    return this.toEntity(record);
  }

  async findAllWithUser(): Promise<any[]> {
    return this.prisma.transaction.findMany({
      include: {
        user: true,
      },
    });
  }
}
