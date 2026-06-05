import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME?.trim() || 'TenderApp Admin';

  if (!email || !password) {
    throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD must be set.');
  }

  if (password.length < 12) {
    throw new Error('ADMIN_PASSWORD must be at least 12 characters.');
  }

  const hashedPassword = await bcrypt.hash(password, 12);
  const user = await prisma.user.upsert({
    where: { email },
    update: {
      name,
      password: hashedPassword,
      role: 'admin',
      authProvider: 'email',
      emailVerifiedAt: new Date(),
    },
    create: {
      name,
      email,
      password: hashedPassword,
      role: 'admin',
      authProvider: 'email',
      emailVerifiedAt: new Date(),
    },
  });

  await prisma.subscription.upsert({
    where: { userId: user.id },
    update: {
      plan: 'enterprise',
      status: 'active',
      teamSize: 1,
    },
    create: {
      userId: user.id,
      plan: 'enterprise',
      status: 'active',
      teamSize: 1,
    },
  });

  console.log(
    JSON.stringify(
      {
        email: user.email,
        userId: user.id,
        role: 'admin',
        plan: 'enterprise',
        status: 'active',
      },
      null,
      2,
    ),
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
