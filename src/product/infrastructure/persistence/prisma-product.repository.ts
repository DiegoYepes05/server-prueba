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

  private toEntity(record: {
    id: string;
    name: string;
    description: string;
    price: number;
    stock: number;
    imageUrl: string | null;
    createdAt: Date;
    updatedAt: Date;
  }): Product {
    return new Product(
      record.id,
      record.name,
      record.description,
      record.price,
      record.stock,
      record.imageUrl ?? undefined,
      record.createdAt,
      record.updatedAt,
    );
  }

  async create(createProductDto: CreateProductDto): Promise<Product> {
    const record = await this.product.create({ data: createProductDto });
    return this.toEntity(record);
  }

  async findAll(): Promise<Product[]> {
    const records = await this.product.findMany();
    return records.map((r) => this.toEntity(r));
  }

  async findOne(id: string): Promise<Product | null> {
    const record = await this.product.findUnique({ where: { id } });
    return record ? this.toEntity(record) : null;
  }

  async update(id: string, data: Partial<Product>): Promise<Product> {
    const record = await this.product.update({ where: { id }, data });
    return this.toEntity(record);
  }
}
