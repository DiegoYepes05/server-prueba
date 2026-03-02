jest.mock('pg', () => ({ Pool: jest.fn().mockImplementation(() => ({})) }));
jest.mock('@prisma/adapter-pg', () => ({
  PrismaPg: jest.fn().mockImplementation(() => ({})),
}));
jest.mock('@prisma/client', () => ({
  PrismaClient: class {
    $connect = jest.fn();
    $disconnect = jest.fn();
  },
}));

import { PrismaProductRepository } from '../src/product/infrastructure/persistence/prisma-product.repository';

describe('PrismaProductRepository', () => {
  let repo: PrismaProductRepository;
  let mockProduct: {
    create: jest.Mock;
    findMany: jest.Mock;
    findUnique: jest.Mock;
    update: jest.Mock;
    deleteMany: jest.Mock;
  };

  const now = new Date();
  const dbRecord = {
    id: 'p1',
    name: 'Camisa',
    description: 'Desc',
    price: 50000,
    stock: 10,
    imageUrl: 'http://img.png',
    createdAt: now,
    updatedAt: now,
  };
  const dbRecordNoImage = {
    id: 'p2',
    name: 'Pantalón',
    description: 'Desc',
    price: 80000,
    stock: 5,
    imageUrl: null,
    createdAt: now,
    updatedAt: now,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    const mockPrisma = new (require('@prisma/client').PrismaClient)();
    repo = new PrismaProductRepository(mockPrisma as any);
    mockProduct = {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      deleteMany: jest.fn(),
    };
    (repo as any).prisma = {
      product: mockProduct,
      $executeRawUnsafe: jest.fn(),
    };
  });

  it('debería estar definido', () => {
    expect(repo).toBeDefined();
  });

  describe('deleteMany', () => {
    it('debería ejecutar TRUNCATE TABLE Product CASCADE', async () => {
      await repo.deleteMany();
      expect((repo as any).prisma.$executeRawUnsafe).toHaveBeenCalledWith(
        'TRUNCATE TABLE "Product" CASCADE;',
      );
    });
  });

  describe('create', () => {
    it('debería crear un producto y retornarlo como entidad', async () => {
      mockProduct.create.mockResolvedValue(dbRecord);
      const dto = {
        name: 'Camisa',
        description: 'Desc',
        price: 50000,
        stock: 10,
      } as any;
      const result = await repo.create(dto);
      expect(result.id).toBe('p1');
      expect(result.name).toBe('Camisa');
      expect(result.imageUrl).toBe('http://img.png');
      expect(mockProduct.create).toHaveBeenCalledWith({ data: dto });
    });

    it('debería manejar imageUrl null convirtiéndola en undefined', async () => {
      mockProduct.create.mockResolvedValue(dbRecordNoImage);
      const result = await repo.create({
        name: 'Pantalón',
        description: 'Desc',
        price: 80000,
        stock: 5,
      } as any);
      expect(result.imageUrl).toBeUndefined();
    });
  });

  describe('findAll', () => {
    it('debería retornar todos los productos como entidades', async () => {
      mockProduct.findMany.mockResolvedValue([dbRecord, dbRecordNoImage]);
      const result = await repo.findAll();
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('p1');
      expect(result[1].imageUrl).toBeUndefined();
    });
  });

  describe('findOne', () => {
    it('debería retornar null si no existe', async () => {
      mockProduct.findUnique.mockResolvedValue(null);
      expect(await repo.findOne('unknown')).toBeNull();
    });

    it('debería retornar el producto si existe', async () => {
      mockProduct.findUnique.mockResolvedValue(dbRecord);
      const result = await repo.findOne('p1');
      expect(result!.id).toBe('p1');
      expect(mockProduct.findUnique).toHaveBeenCalledWith({
        where: { id: 'p1' },
      });
    });
  });

  describe('update', () => {
    it('debería actualizar y retornar el producto', async () => {
      const updated = { ...dbRecord, stock: 9 };
      mockProduct.update.mockResolvedValue(updated);
      const result = await repo.update('p1', { stock: 9 });
      expect(result.stock).toBe(9);
      expect(mockProduct.update).toHaveBeenCalledWith({
        where: { id: 'p1' },
        data: { stock: 9 },
      });
    });
  });
});
