import { Product } from './product.entity';
import { CreateProductDto } from '../dto/create-product.dto';

export interface ProductRepository {
  create(data: CreateProductDto): Promise<Product>;
  findAll(): Promise<Product[]>;
  findOne(id: string): Promise<Product | null>;
}

export const PRODUCT_REPOSITORY = 'PRODUCT_REPOSITORY';
