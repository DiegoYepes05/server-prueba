import { of } from 'rxjs';
import { WompiPaymentAdapter } from '../src/payment/infrastructure/persistence/wompi-payment.adapter';

describe('WompiPaymentAdapter', () => {
  let adapter: WompiPaymentAdapter;
  let mockHttpService: any;
  let mockConfigService: any;

  beforeEach(() => {
    mockHttpService = {
      get: jest.fn(),
      post: jest.fn(),
    };
    mockConfigService = {
      get: jest.fn((key: string) => {
        const map: Record<string, string> = {
          BASE_URL: 'https://api-sandbox.wompi.dev/v1',
          PUBLIC_KEY: 'pub_test_key',
          INTEGRITY_SECRET: 'secret123',
        };
        return map[key];
      }),
    };

    adapter = new WompiPaymentAdapter(mockHttpService, mockConfigService);
  });

  it('debería estar definido', () => {
    expect(adapter).toBeDefined();
  });

  describe('generateReference', () => {
    it('debería generar una referencia única con formato ORDER-', () => {
      const ref = adapter.generateReference();
      expect(ref).toMatch(/^ORDER-\d+-[A-Z0-9]{6}$/);
    });
  });

  describe('generateSignature', () => {
    it('debería generar una firma SHA256', () => {
      const sig = adapter.generateSignature('REF-001', 100000, 'COP');
      expect(sig).toHaveLength(64); 
      expect(sig).toMatch(/^[a-f0-9]+$/);
    });

    it('firmas distintas para referencias distintas', () => {
      const sig1 = adapter.generateSignature('REF-001', 100000, 'COP');
      const sig2 = adapter.generateSignature('REF-002', 100000, 'COP');
      expect(sig1).not.toBe(sig2);
    });
  });

  describe('getMerchantInfo', () => {
    it('debería retornar la info del merchant', async () => {
      const mockData = { id: 'merchant1', name: 'Test Merchant' };
      mockHttpService.get.mockReturnValue(of({ data: mockData }));

      const result = await adapter.getMerchantInfo();
      expect(result).toEqual(mockData);
      expect(mockHttpService.get).toHaveBeenCalledWith(
        'https://api-sandbox.wompi.dev/v1/merchants/pub_test_key',
      );
    });
  });

  describe('createCardToken', () => {
    it('debería crear un token de tarjeta', async () => {
      const mockData = { id: 'tok_test_123' };
      mockHttpService.post.mockReturnValue(of({ data: mockData }));

      const body = {
        number: '4111111111111111',
        cvc: '123',
        exp_month: '01',
        exp_year: '28',
        card_holder: 'Test',
      };
      const result = await adapter.createCardToken(body as any);
      expect(result).toEqual(mockData);
      expect(mockHttpService.post).toHaveBeenCalledWith(
        'https://api-sandbox.wompi.dev/v1/tokens/cards',
        body,
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer pub_test_key',
          }),
        }),
      );
    });
  });

  describe('createTransaction', () => {
    it('debería crear una transacción en Wompi', async () => {
      const mockData = { data: { id: '123', status: 'APPROVED' } };
      mockHttpService.post.mockReturnValue(of({ data: mockData }));

      const payload = { reference: 'REF1', amount_in_cents: 1000 } as any;
      const result = await adapter.createTransaction(payload);
      expect(result).toEqual(mockData);
      expect(mockHttpService.post).toHaveBeenCalledWith(
        'https://api-sandbox.wompi.dev/v1/transactions',
        payload,
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer pub_test_key',
          }),
        }),
      );
    });
  });

  describe('getTransaction', () => {
    it('debería obtener una transacción por id', async () => {
      const mockData = { data: { id: 'tx1', status: 'APPROVED' } };
      mockHttpService.get.mockReturnValue(of({ data: mockData }));

      const result = await adapter.getTransaction('tx1');
      expect(result).toEqual(mockData);
      expect(mockHttpService.get).toHaveBeenCalledWith(
        'https://api-sandbox.wompi.dev/v1/transactions/tx1',
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer pub_test_key',
          }),
        }),
      );
    });
  });
});
