import { Transaction } from '../src/payment/domain/transaction.entity';

describe('Transaction Entity', () => {
  it('debería crear una instancia con todas las propiedades', () => {
    const now = new Date();
    const tx = new Transaction(
      '1',
      'REF-001',
      100000,
      'COP',
      'PENDING',
      'test@test.com',
      now,
    );

    expect(tx.id).toBe('1');
    expect(tx.reference).toBe('REF-001');
    expect(tx.amountInCents).toBe(100000);
    expect(tx.currency).toBe('COP');
    expect(tx.status).toBe('PENDING');
    expect(tx.customerEmail).toBe('test@test.com');
    expect(tx.createdAt).toBe(now);
  });

  it('debería crear una instancia sin createdAt', () => {
    const tx = new Transaction(
      '2',
      'REF-002',
      50000,
      'COP',
      'APPROVED',
      'other@test.com',
    );
    expect(tx.createdAt).toBeUndefined();
  });
});
