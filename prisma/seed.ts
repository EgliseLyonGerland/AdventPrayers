import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import personsData from "./seed/persons";
import drawsData from "./seed/draws";

const prisma = new PrismaClient();

async function seed() {
  const email = "oltodo@msn.com";

  // cleanup the existing database
  await prisma.user.delete({ where: { email } }).catch(() => {
    // no worries if it doesn't exist yet
  });

  const hashedPassword = await bcrypt.hash("123456", 10);

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
    personsData.map((data) => prisma.person.create({ data }))
  );

  await Promise.all(
    drawsData.map((draw) =>
      prisma.draw.create({
        data: {
          year: draw.year,
          players: {
            create: Object.entries(draw.relations).map(([from, to]) => ({
              person: {
                connect: {
                  id: persons.find((person) => person.slug === from)?.id,
                },
              },
              assigned: {
                connect: {
                  id: persons.find((person) => person.slug === to)?.id,
                },
              },
            })),
          },
        },
      })
    )
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
