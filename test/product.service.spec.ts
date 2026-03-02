import { Test, TestingModule } from '@nestjs/testing';
import { ProductService } from '../src/product/application/product.service';
import { PRODUCT_REPOSITORY } from '../src/product/domain/product.repository';
import { STORAGE_REPOSITORY } from '../src/product/domain/storage.repository';

describe('ProductService', () => {
  let service: ProductService;
  let productRepository: any;
  let storageRepository: any;

  beforeEach(async () => {
    const mockProductRepository = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
    };
    const mockStorageRepository = {
      uploadFile: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductService,
        { provide: PRODUCT_REPOSITORY, useValue: mockProductRepository },
        { provide: STORAGE_REPOSITORY, useValue: mockStorageRepository },
      ],
    }).compile();

    service = module.get<ProductService>(ProductService);
    productRepository = module.get(PRODUCT_REPOSITORY);
    storageRepository = module.get(STORAGE_REPOSITORY);
  });

  it('debería estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('debería crear un producto', async () => {
      const dto = { name: 'Test', description: 'Desc', price: 100, stock: 10 };
      productRepository.create.mockResolvedValue({ id: '1', ...dto });
      const result = await service.create(dto as any);
      expect(result).toEqual({ id: '1', ...dto });
      expect(productRepository.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('findAll', () => {
    it('debería retornar todos los productos', async () => {
      const products = [{ id: '1', name: 'Test' }];
      productRepository.findAll.mockResolvedValue(products);
      const result = await service.findAll();
      expect(result).toEqual(products);
      expect(productRepository.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('debería retornar un producto por id', async () => {
      const product = { id: '1', name: 'Test' };
      productRepository.findOne.mockResolvedValue(product);
      const result = await service.findOne('1');
      expect(result).toEqual(product);
      expect(productRepository.findOne).toHaveBeenCalledWith('1');
    });
  });

  describe('uploadS3', () => {
    it('debería subir un archivo a S3', async () => {
      const file = {
        buffer: Buffer.from('test'),
        originalname: 'test.png',
        mimetype: 'image/png',
        size: 100,
      };
      storageRepository.uploadFile.mockResolvedValue('http://url.com/test.png');
      const result = await service.uploadS3(file as any);
      expect(result).toBe('http://url.com/test.png');
      expect(storageRepository.uploadFile).toHaveBeenCalledWith(file);
    });
  });
});
