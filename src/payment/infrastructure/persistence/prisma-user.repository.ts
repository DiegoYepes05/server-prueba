import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma.service';
import { User, UserRepository } from '../../domain/user.repository';

@Injectable()
export class PrismaUserRepository implements UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) return null;
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      legalId: user.legalId,
      legalIdType: user.legalIdType,
    };
  }

  async create(data: Omit<User, 'id'>): Promise<User> {
    const user = await this.prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        phone: data.phone,
        legalId: data.legalId,
        legalIdType: data.legalIdType,
      },
    });
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      legalId: user.legalId,
      legalIdType: user.legalIdType,
    };
  }
}
