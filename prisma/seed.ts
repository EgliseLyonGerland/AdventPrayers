import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

import drawsData from "./seed/draws";
import personsData from "./seed/persons";

const prisma = new PrismaClient();

async function seed() {
  const email = "oltodo@msn.com";

  // cleanup the existing database
  await prisma.user.delete({ where: { email } }).catch(() => {
    // no worries if it doesn't exist yet
  });

  const hashedPassword = await bcrypt.hash("azerty123456", 10);

  await prisma.user.create({
    data: {
      email,
      password: {
        create: {
          hash: hashedPassword,
        },
      },
    },
  });

  const persons = await Promise.all(
    personsData.map((data) => prisma.person.create({ data })),
  );

  await Promise.all(
    drawsData.map((draw) =>
      prisma.draw.create({
        data: {
          year: draw.year,
          drawn: true,
          players: {
            create: Object.entries(draw.relations).map(([from, to]) => ({
              personId: persons.find((person) => person.slug === from)!.id,
              assignedId: persons.find((person) => person.slug === to)!.id,
              age: persons.find((person) => person.slug === from)!.age,
            })),
          },
        },
      }),
    ),
  );

  console.log(`Database has been seeded. 🌱`);
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
