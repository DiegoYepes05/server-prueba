import { Module } from '@nestjs/common';
import { ProductService } from './application/product.service';
import { ProductController } from './infrastructure/controllers/product.controller';
import { PRODUCT_REPOSITORY } from './domain/product.repository';
import { PrismaProductRepository } from './infrastructure/persistence/prisma-product.repository';
import { STORAGE_REPOSITORY } from './domain/storage.repository';
import { S3StorageRepository } from './infrastructure/persistence/s3-storage.repository';

@Module({
  controllers: [ProductController],
  providers: [
    ProductService,
    {
      provide: PRODUCT_REPOSITORY,
      useClass: PrismaProductRepository,
    },
    {
      provide: STORAGE_REPOSITORY,
      useClass: S3StorageRepository,
    },
  ],
})
export class ProductModule {}
