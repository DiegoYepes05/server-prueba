jest.mock('pg', () => ({ Pool: jest.fn().mockImplementation(() => ({})) }));
jest.mock('@prisma/adapter-pg', () => ({
  PrismaPg: jest.fn().mockImplementation(() => ({})),
}));
jest.mock('@prisma/client', () => ({
  PrismaClient: class {
    $connect = jest.fn();
    $disconnect = jest.fn();
  },
  DeliveryStatus: { PENDING: 'PENDING' },
}));

import { PrismaDeliveryRepository } from '../src/payment/infrastructure/persistence/prisma-delivery.repository';

describe('PrismaDeliveryRepository', () => {
  let repo: PrismaDeliveryRepository;
  let mockCreate: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    const mockPrisma = new (require('@prisma/client').PrismaClient)();
    repo = new PrismaDeliveryRepository(mockPrisma as any);
    mockCreate = jest.fn();
    (repo as any).prisma = { delivery: { create: mockCreate } };
  });

  it('debería estar definido', () => {
    expect(repo).toBeDefined();
  });

  describe('create', () => {
    it('debería crear una entrega y retornarla', async () => {
      const data = {
        address: 'Calle 1',
        city: 'Bogota',
        department: 'DC',
        status: 'PENDING',
        userId: 'user1',
        transactionId: 'tx1',
      };
      const dbRecord = {
        id: 'del1',
        ...data,
        status: { toString: () => 'PENDING' },
      };
      mockCreate.mockResolvedValue(dbRecord);

      const result = await repo.create(data);

      expect(result.id).toBe('del1');
      expect(result.address).toBe('Calle 1');
      expect(result.status).toBe('PENDING');
      expect(mockCreate).toHaveBeenCalledWith({
        data: {
          address: data.address,
          city: data.city,
          department: data.department,
          status: 'PENDING',
          userId: data.userId,
          transactionId: data.transactionId,
        },
      });
    });
  });
});
