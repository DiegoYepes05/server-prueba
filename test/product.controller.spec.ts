import { Test, TestingModule } from '@nestjs/testing';
import { ProductController } from '../src/product/infrastructure/controllers/product.controller';
import { ProductService } from '../src/product/application/product.service';

describe('ProductController', () => {
  let controller: ProductController;
  let service: ProductService;

  beforeEach(async () => {
    const mockProductService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      uploadS3: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductController],
      providers: [{ provide: ProductService, useValue: mockProductService }],
    }).compile();

    controller = module.get<ProductController>(ProductController);
    service = module.get<ProductService>(ProductService);
  });

  it('debería estar definido', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('debería llamar a productService.create', async () => {
      const dto = { name: 'Test', description: 'Desc', price: 100, stock: 10 };
      await controller.create(dto as any);
      expect(service.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('findAll', () => {
    it('debería llamar a productService.findAll', async () => {
      await controller.findAll();
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('debería llamar a productService.findOne', async () => {
      await controller.findOne('1');
      expect(service.findOne).toHaveBeenCalledWith('1');
    });
  });

  describe('uploadFile', () => {
    it('debería llamar a productService.uploadS3 con los datos del archivo', async () => {
      const file = {
        buffer: Buffer.from('test'),
        originalname: 'test.png',
        mimetype: 'image/png',
        size: 100,
      } as any;
      await controller.uploadFile(file);
      expect(service.uploadS3).toHaveBeenCalledWith({
        buffer: file.buffer,
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
      });
    });
  });
});
