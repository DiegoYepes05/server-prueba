import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seed start...');

  await prisma.product.deleteMany();

  const products = [
    {
      name: 'Café de Especialidad - Antioquia',
      description:
        'Granos de café 100% Arábica cultivados en las montañas de Antioquia, con notas de chocolate y caramelo.',
      price: 45000,
      stock: 50,
      imageUrl:
        'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&q=80&w=800',
    },
    {
      name: 'Kit de Prensa Francesa',
      description:
        'Prensa francesa de acero inoxidable con jarra de vidrio de borosilicato, ideal para el café de la mañana.',
      price: 120000,
      stock: 20,
      imageUrl:
        'https://images.unsplash.com/photo-1544194244-109f2331468e?auto=format&fit=crop&q=80&w=800',
    },
    {
      name: 'Molinillo de Café Manual',
      description:
        'Molinillo con muelas de cerámica ajustable para obtener la molienda perfecta para tu método favorito.',
      price: 85000,
      stock: 15,
      imageUrl:
        'https://images.unsplash.com/photo-1580915411954-282cb1b0d780?auto=format&fit=crop&q=80&w=800',
    },
    {
      name: 'Taza de Cerámica Artesanal',
      description:
        'Taza hecha a mano por artesanos locales, con un diseño único y elegante.',
      price: 35000,
      stock: 30,
      imageUrl:
        'https://images.unsplash.com/photo-1514228742587-6b1558fbed20?auto=format&fit=crop&q=80&w=800',
    },
    {
      name: 'Balanza Digital de Precisión',
      description:
        'Balanza con temporizador integrado, esencial para controlar la proporción exacta de tu café.',
      price: 95000,
      stock: 10,
      imageUrl:
        'https://images.unsplash.com/photo-1557821314-dc6e7c30985c?auto=format&fit=crop&q=80&w=800',
    },
    {
      name: 'Jarros para Espumar Leche',
      description:
        'Jarros de acero inoxidable de 350ml, perfecto para practicar tu latte art en casa.',
      price: 40000,
      stock: 25,
      imageUrl:
        'https://images.unsplash.com/photo-1517088455889-bfa75135412c?auto=format&fit=crop&q=80&w=800',
    },
  ];

  for (const product of products) {
    await prisma.product.create({
      data: product,
    });
  }

  console.log('Seed finished successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
