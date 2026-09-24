const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findUnique({ where: { email: 'prabhav@demo.com' } });
  console.log('User found:', user ? 'Yes' : 'No');
  if (user) {
    console.log('Password hash:', user.passwordHash ? 'Exists' : 'No');
  }
}
main().finally(() => prisma.$disconnect());
