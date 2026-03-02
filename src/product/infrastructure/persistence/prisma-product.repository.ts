import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma.service';
import { ProductRepository } from '../../domain/product.repository';
import { Product } from '../../domain/product.entity';
import { CreateProductDto } from '../../dto/create-product.dto';

@Injectable()
export class PrismaProductRepository implements ProductRepository {
  constructor(private readonly prisma: PrismaService) {}

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
    const record = await this.prisma.product.create({ data: createProductDto });
    return this.toEntity(record);
  }

  async findAll(): Promise<Product[]> {
    const records = await this.prisma.product.findMany();
    return records.map((r) => this.toEntity(r));
  }

  async findOne(id: string): Promise<Product | null> {
    const record = await this.prisma.product.findUnique({ where: { id } });
    return record ? this.toEntity(record) : null;
  }

  async update(id: string, data: Partial<Product>): Promise<Product> {
    const record = await this.prisma.product.update({ where: { id }, data });
    return this.toEntity(record);
  }

  async decrementStock(id: string): Promise<Product> {
    const record = await this.prisma.product.update({
      where: { id },
      data: {
        stock: {
          decrement: 1,
        },
      },
    });
    return this.toEntity(record);
  }

  async deleteMany(): Promise<void> {
    await this.prisma.$executeRawUnsafe('TRUNCATE TABLE "Product" CASCADE;');
  }
}
