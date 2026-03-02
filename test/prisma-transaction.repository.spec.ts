jest.mock('pg', () => ({ Pool: jest.fn().mockImplementation(() => ({})) }));
jest.mock('@prisma/adapter-pg', () => ({
  PrismaPg: jest.fn().mockImplementation(() => ({})),
}));
jest.mock('@prisma/client', () => ({
  PrismaClient: class {
    $connect = jest.fn();
    $disconnect = jest.fn();
  },
  TransactionStatus: {
    PENDING: 'PENDING',
    APPROVED: 'APPROVED',
    ERROR: 'ERROR',
  },
}));

import { PrismaTransactionRepository } from '../src/payment/infrastructure/persistence/prisma-transaction.repository';

describe('PrismaTransactionRepository', () => {
  let repo: PrismaTransactionRepository;
  let mockTx: {
    create: jest.Mock;
    update: jest.Mock;
    findUnique: jest.Mock;
    findMany: jest.Mock;
  };

  const dbRecord = {
    id: 'tx1',
    wompiId: 'w1',
    reference: 'REF-001',
    amountInCents: 100000,
    currency: 'COP',
    status: { toString: () => 'PENDING' },
    installments: 1,
    productId: 'prod1',
    userId: 'user1',
    shippingAddress: 'Calle 1',
    shippingCity: 'Bogota',
    shippingDepartment: 'DC',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    const mockPrisma = new (require('@prisma/client').PrismaClient)();
    repo = new PrismaTransactionRepository(mockPrisma as any);
    mockTx = {
      create: jest.fn(),
      update: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
    };
    (repo as any).prisma = { transaction: mockTx };
  });

  it('debería estar definido', () => {
    expect(repo).toBeDefined();
  });

  describe('create', () => {
    it('debería crear una transacción', async () => {
      mockTx.create.mockResolvedValue(dbRecord);
      const data = {
        reference: 'REF-001',
        amountInCents: 100000,
        currency: 'COP',
        status: 'PENDING',
        installments: 1,
        productId: 'prod1',
        userId: 'user1',
        shippingAddress: 'Calle 1',
        shippingCity: 'Bogota',
        shippingDepartment: 'DC',
      };
      const result = await repo.create(data);
      expect(result.id).toBe('tx1');
      expect(result.reference).toBe('REF-001');
      expect(result.shippingAddress).toBe('Calle 1');
    });
  });

  describe('updateStatus', () => {
    it('debería actualizar el status con wompiId', async () => {
      const updated = { ...dbRecord, status: { toString: () => 'APPROVED' } };
      mockTx.update.mockResolvedValue(updated);

      const result = await repo.updateStatus('tx1', 'APPROVED', 'w1');
      expect(result.id).toBe('tx1');
      expect(mockTx.update).toHaveBeenCalledWith({
        where: { id: 'tx1' },
        data: { status: 'APPROVED', wompiId: 'w1' },
      });
    });

    it('debería actualizar el status sin wompiId', async () => {
      mockTx.update.mockResolvedValue(dbRecord);
      await repo.updateStatus('tx1', 'ERROR');
      expect(mockTx.update).toHaveBeenCalledWith({
        where: { id: 'tx1' },
        data: { status: 'ERROR', wompiId: undefined },
      });
    });
  });

  describe('findById', () => {
    it('debería retornar null si no existe', async () => {
      mockTx.findUnique.mockResolvedValue(null);
      expect(await repo.findById('none')).toBeNull();
    });

    it('debería retornar la transacción si existe', async () => {
      mockTx.findUnique.mockResolvedValue(dbRecord);
      const result = await repo.findById('tx1');
      expect(result!.id).toBe('tx1');
      expect(result!.shippingAddress).toBe('Calle 1');
    });
  });

  describe('findByWompiId', () => {
    it('debería retornar null si no existe', async () => {
      mockTx.findUnique.mockResolvedValue(null);
      expect(await repo.findByWompiId('wnone')).toBeNull();
    });

    it('debería retornar la transacción si existe', async () => {
      mockTx.findUnique.mockResolvedValue(dbRecord);
      const result = await repo.findByWompiId('w1');
      expect(result!.wompiId).toBe('w1');
    });
  });

  describe('findAllWithUser', () => {
    it('debería retornar todas las transacciones con usuario', async () => {
      mockTx.findMany.mockResolvedValue([dbRecord]);
      const result = await repo.findAllWithUser();
      expect(result).toHaveLength(1);
      expect(mockTx.findMany).toHaveBeenCalledWith({ include: { user: true } });
    });
  });
});
