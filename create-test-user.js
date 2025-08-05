const bcrypt = require('bcrypt');
const { PrismaClient } = require('./generated/prisma');

const prisma = new PrismaClient();

async function createTestUser() {
  try {
    const email = 'test@example.com';
    const password = 'password123';
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email: email,
        password_hash: hashedPassword,
        full_name: 'Test User',
        isAdmin: false,
        status: 'ACTIVE',
      },
    });

    console.log('Test user created successfully:');
    console.log(`Email: ${user.email}`);
    console.log(`Password: ${password}`);
    console.log(`User ID: ${user.id}`);
  } catch (error) {
    if (error.code === 'P2002') {
      console.log('User with this email already exists');
    } else {
      console.error('Error creating test user:', error);
    }
  } finally {
    await prisma.$disconnect();
  }
}

createTestUser();