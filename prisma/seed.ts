import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { config } from "dotenv";

config(); // Load .env

const adapter = new PrismaPg({ connectionString: process.env.DIRECT_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database...");

  // 1. Seed Airlines Criteria
  const airlines = [
    {
      airlineName: "Emirates",
      minHeightFemale: 160,
      minHeightMale: 165,
      minArmReach: 212,
      maxBMI: 25,
      maxAge: 30,
      requiredSwimming: true,
      requiredLanguages: JSON.stringify([
        { name: "English", minLevel: "B2" },
      ]),
    },
    {
      airlineName: "Qatar Airways",
      minHeightFemale: 160,
      minHeightMale: 165,
      minArmReach: 212,
      maxBMI: 25,
      maxAge: 32,
      requiredSwimming: true,
      requiredLanguages: JSON.stringify([
        { name: "English", minLevel: "B2" },
      ]),
    },
    {
      airlineName: "Royal Air Maroc",
      minHeightFemale: 160,
      minHeightMale: 170,
      minArmReach: null,
      maxBMI: 26,
      maxAge: 27,
      requiredSwimming: true,
      requiredLanguages: JSON.stringify([
        { name: "French", minLevel: "B2" },
        { name: "English", minLevel: "B1" },
        { name: "Arabic", minLevel: "C1" },
      ]),
    },
    {
      airlineName: "Air Arabia",
      minHeightFemale: 160,
      minHeightMale: 165,
      minArmReach: 212,
      maxBMI: 25,
      maxAge: 28,
      requiredSwimming: true,
      requiredLanguages: JSON.stringify([
        { name: "English", minLevel: "B2" },
      ]),
    }
  ];

  for (const airline of airlines) {
    await prisma.airlineCriteria.upsert({
      where: { airlineName: airline.airlineName },
      update: airline,
      create: airline,
    });
  }
  console.log("✅ Airlines seeded");

  // 2. Seed a sample student
  const sampleStudent = await prisma.student.upsert({
    where: { cin: "AB123456" },
    update: {},
    create: {
      fullName: "Fatima Zahra",
      cin: "AB123456",
      phone: "+212600000000",
      email: "fatima@example.com",
      dateOfBirth: new Date("1999-05-15"),
      gender: "FEMALE",
      height: 165,
      weight: 58,
      bmi: 21.3,
      armReach: 214,
      cempnIssueDate: new Date("2026-01-01"),
      cempnExpirationDate: new Date("2028-01-01"),
      cempnStatus: "VALID",
      swimmingStatus: "PASSED",
      dgacStatus: "CERTIFIED",
      placementStatus: "APPLIED",
      languages: {
        create: [
          { name: "English", level: "B2" },
          { name: "French", level: "C1" },
          { name: "Arabic", level: "C2" },
        ],
      },
    },
  });

  console.log(`✅ Sample student ${sampleStudent.fullName} seeded`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
