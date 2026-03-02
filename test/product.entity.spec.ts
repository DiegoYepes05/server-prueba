import { Product } from '../src/product/domain/product.entity';

describe('Product Entity', () => {
  it('debería crear una instancia con todas las propiedades', () => {
    const now = new Date();
    const product = new Product(
      '1',
      'Camisa',
      'Desc',
      50000,
      10,
      'http://img.png',
      now,
      now,
    );

    expect(product.id).toBe('1');
    expect(product.name).toBe('Camisa');
    expect(product.description).toBe('Desc');
    expect(product.price).toBe(50000);
    expect(product.stock).toBe(10);
    expect(product.imageUrl).toBe('http://img.png');
    expect(product.createdAt).toBe(now);
    expect(product.updatedAt).toBe(now);
  });

  it('debería crear una instancia sin imageUrl ni fechas', () => {
    const product = new Product('2', 'Pantalón', 'Desc', 80000, 5);
    expect(product.imageUrl).toBeUndefined();
    expect(product.createdAt).toBeUndefined();
    expect(product.updatedAt).toBeUndefined();
  });
});
