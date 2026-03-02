import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma.service';
import { DeliveryStatus } from '@prisma/client';
import { Delivery, DeliveryRepository } from '../../domain/delivery.repository';

@Injectable()
export class PrismaDeliveryRepository implements DeliveryRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Omit<Delivery, 'id'>): Promise<Delivery> {
    const delivery = await this.prisma.delivery.create({
      data: {
        address: data.address,
        city: data.city,
        department: data.department,
        status: data.status as DeliveryStatus,
        userId: data.userId,
        transactionId: data.transactionId,
      },
    });
    return {
      ...delivery,
      status: delivery.status.toString(),
    };
  }
}
