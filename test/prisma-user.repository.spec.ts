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

import { PrismaUserRepository } from '../src/payment/infrastructure/persistence/prisma-user.repository';

describe('PrismaUserRepository', () => {
  let repo: PrismaUserRepository;
  let mockFindUnique: jest.Mock;
  let mockCreate: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    const mockPrisma = new (require('@prisma/client').PrismaClient)();
    repo = new PrismaUserRepository(mockPrisma as any);
    mockFindUnique = jest.fn();
    mockCreate = jest.fn();
    (repo as any).prisma = {
      user: { findUnique: mockFindUnique, create: mockCreate },
    };
  });

  it('debería estar definido', () => {
    expect(repo).toBeDefined();
  });

  describe('findByEmail', () => {
    it('debería retornar null si no existe el usuario', async () => {
      mockFindUnique.mockResolvedValue(null);
      const result = await repo.findByEmail('noexiste@test.com');
      expect(result).toBeNull();
    });

    it('debería retornar el usuario si existe', async () => {
      const dbUser = {
        id: 'u1',
        email: 'test@test.com',
        name: 'Test',
        phone: '123',
        legalId: '456',
        legalIdType: 'CC',
      };
      mockFindUnique.mockResolvedValue(dbUser);
      const result = await repo.findByEmail('test@test.com');
      expect(result).toEqual(dbUser);
      expect(mockFindUnique).toHaveBeenCalledWith({
        where: { email: 'test@test.com' },
      });
    });
  });

  describe('create', () => {
    it('debería crear y retornar un usuario', async () => {
      const data = {
        email: 'nuevo@test.com',
        name: 'Nuevo',
        phone: '321',
        legalId: '789',
        legalIdType: 'CC',
      };
      const dbUser = { id: 'u2', ...data };
      mockCreate.mockResolvedValue(dbUser);

      const result = await repo.create(data);
      expect(result.id).toBe('u2');
      expect(result.email).toBe('nuevo@test.com');
      expect(mockCreate).toHaveBeenCalledWith({
        data: {
          email: data.email,
          name: data.name,
          phone: data.phone,
          legalId: data.legalId,
          legalIdType: data.legalIdType,
        },
      });
    });
  });
});
