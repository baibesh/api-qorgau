import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  // Create regions
  const regions = [
    { name: 'Алматы' },
    { name: 'Нур-Султан' },
    { name: 'Шымкент' },
    { name: 'Алматинская область' },
    { name: 'Акмолинская область' },
    { name: 'Актюбинская область' },
    { name: 'Атырауская область' },
    { name: 'Восточно-Казахстанская область' },
    { name: 'Жамбылская область' },
    { name: 'Западно-Казахстанская область' },
    { name: 'Карагандинская область' },
    { name: 'Костанайская область' },
    { name: 'Кызылординская область' },
    { name: 'Мангистауская область' },
    { name: 'Павлодарская область' },
    { name: 'Северо-Казахстанская область' },
    { name: 'Туркестанская область' },
  ];

  console.log('Creating regions...');
  for (const regionData of regions) {
    await prisma.region.upsert({
      where: { name: regionData.name },
      update: {},
      create: regionData,
    });
  }

  // Get the first region for the admin user
  const firstRegion = await prisma.region.findFirst();

  // Hash the admin password
  const hashedPassword = await bcrypt.hash('Qqwerty1!', 10);

  // Create admin user
  console.log('Creating admin user...');
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@qorgau.kz' },
    update: {},
    create: {
      email: 'admin@qorgau.kz',
      password_hash: hashedPassword,
      full_name: 'Администратор Системы',
      isAdmin: true,
      status: 'ACTIVE',
      phone: '+7 (777) 123-45-67',
      region_id: firstRegion?.id || null,
    },
  });

  console.log('Admin user created:', {
    id: adminUser.id,
    email: adminUser.email,
    full_name: adminUser.full_name,
    isAdmin: adminUser.isAdmin,
  });

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error during seed:', e);
    process.exit(1);
  })
  .finally(() => {
    void prisma.$disconnect();
  });