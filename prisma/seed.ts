import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import bcrypt from 'bcryptjs';
import 'dotenv/config';

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Seeding database...');

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@showcase.com' },
    update: {},
    create: {
      email: 'admin@showcase.com',
      password: hashedPassword,
      name: 'Admin',
      role: 'ADMIN',
      bio: 'Platform administrator',
    },
  });
  console.log(`✅ Admin user created: ${admin.email}`);

  // Create default categories
  const categories = [
    'Photography', 'Videography', 'Study Material',
    'Design', 'Development', 'Music', 'Art', 'Other',
  ];

  for (const name of categories) {
    await prisma.category.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }
  console.log(`✅ ${categories.length} categories created`);

  console.log('🎉 Seeding complete!');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
