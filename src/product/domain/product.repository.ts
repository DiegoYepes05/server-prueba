import { Product } from './product.entity';
import { CreateProductDto } from '../dto/create-product.dto';

export interface ProductRepository {
  create(data: CreateProductDto): Promise<Product>;
  findAll(): Promise<Product[]>;
  findOne(id: string): Promise<Product | null>;
  update(id: string, data: Partial<Product>): Promise<Product>;
  decrementStock(id: string): Promise<Product>;
  deleteMany(): Promise<void>;
}

export const PRODUCT_REPOSITORY = 'PRODUCT_REPOSITORY';
