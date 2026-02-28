import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool, PoolConfig } from 'pg';
import { ProductRepository } from '../../domain/product.repository';
import { Product } from '../../domain/product.entity';
import { CreateProductDto } from '../../dto/create-product.dto';

@Injectable()
export class PrismaProductRepository
  extends PrismaClient
  implements ProductRepository
{
  constructor() {
    const poolConfig: PoolConfig = {
      host: process.env.POSTGRES_HOST,
      port: Number(process.env.POSTGRES_PORT),
      user: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_DB,
    };

    const pool = new Pool(poolConfig);
    const adapter = new PrismaPg(pool);

    super({ adapter });
  }

  async create(createProductDto: CreateProductDto): Promise<Product> {
    return this.product.create({
      data: createProductDto,
    });
  }

  async findAll(): Promise<Product[]> {
    return this.product.findMany();
  }

  async findOne(id: string): Promise<Product | null> {
    return this.product.findUnique({
      where: { id },
    });
  }
}
