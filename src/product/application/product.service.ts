import { Inject, Injectable } from '@nestjs/common';
import { CreateProductDto } from '../dto/create-product.dto';
import {
  ProductRepository,
  PRODUCT_REPOSITORY,
} from '../domain/product.repository';
import {
  STORAGE_REPOSITORY,
  StorageRepository,
} from '../domain/storage.repository';
import { UploadFile } from '../domain/file.interface';

@Injectable()
export class ProductService {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: ProductRepository,
    @Inject(STORAGE_REPOSITORY)
    private readonly storageRepository: StorageRepository,
  ) {}

  create(createProductDto: CreateProductDto) {
    return this.productRepository.create(createProductDto);
  }

  findAll() {
    return this.productRepository.findAll();
  }

  findOne(id: string) {
    return this.productRepository.findOne(id);
  }

  uploadS3(file: UploadFile) {
    return this.storageRepository.uploadFile(file);
  }
}
