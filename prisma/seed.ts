import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create test users
  const user1 = await prisma.user.create({
    data: {
      email: 'admin@omicsvault.com',
      name: 'Dr. Sarah Chen',
      passwordHash: await hash('password123', 12),
    },
  })

  const user2 = await prisma.user.create({
    data: {
      email: 'researcher@omicsvault.com',
      name: 'Dr. James Wilson',
      passwordHash: await hash('password123', 12),
    },
  })

  console.log('✅ Created test users')

  // Create test lab
  const lab = await prisma.lab.create({
    data: {
      name: 'Genomics Research Lab',
      description: 'Main genomics and proteomics research facility',
      members: {
        create: [
          { userId: user1.id, role: 'ADMIN' },
          { userId: user2.id, role: 'MEMBER' },
        ],
      },
    },
  })

  console.log('✅ Created test lab')

  // Create location hierarchy
  const room = await prisma.location.create({
    data: {
      name: 'Lab Room 301',
      type: 'Room',
      description: 'Main research lab on 3rd floor',
      labId: lab.id,
    },
  })

  const freezer = await prisma.location.create({
    data: {
      name: 'Freezer A',
      type: 'Freezer',
      description: '-80°C ultra-low temperature freezer',
      labId: lab.id,
      parentId: room.id,
    },
  })

  const shelf1 = await prisma.location.create({
    data: {
      name: 'Shelf 1',
      type: 'Shelf',
      labId: lab.id,
      parentId: freezer.id,
    },
  })

  const box1 = await prisma.location.create({
    data: {
      name: 'Box A1',
      type: 'Box',
      description: 'Antibody storage',
      labId: lab.id,
      parentId: shelf1.id,
    },
  })

  const refrigerator = await prisma.location.create({
    data: {
      name: 'Refrigerator B',
      type: 'Refrigerator',
      description: '4°C refrigerator for reagents',
      labId: lab.id,
      parentId: room.id,
    },
  })

  const shelf2 = await prisma.location.create({
    data: {
      name: 'Shelf 2',
      type: 'Shelf',
      labId: lab.id,
      parentId: refrigerator.id,
    },
  })

  console.log('✅ Created location hierarchy')

  // Create test items
  const item1 = await prisma.item.create({
    data: {
      name: 'Anti-CD3 Antibody',
      category: 'Antibody',
      vendor: 'BioLegend',
      catalogNumber: '317326',
      lotNumber: 'B345678',
      quantity: 50,
      unit: 'µg',
      minQuantity: 20,
      remarks: 'Mouse monoclonal antibody for flow cytometry',
      labId: lab.id,
      locationId: box1.id,
      createdById: user1.id,
      lastUpdatedById: user1.id,
    },
  })

  const item2 = await prisma.item.create({
    data: {
      name: 'Tris-HCl Buffer pH 8.0',
      category: 'Buffer',
      vendor: 'Sigma-Aldrich',
      catalogNumber: 'T5941',
      lotNumber: 'SLCH1234',
      quantity: 500,
      unit: 'mL',
      minQuantity: 100,
      labId: lab.id,
      locationId: shelf2.id,
      createdById: user1.id,
      lastUpdatedById: user1.id,
    },
  })

  const item3 = await prisma.item.create({
    data: {
      name: 'PCR Master Mix',
      category: 'Reagent',
      vendor: 'Thermo Fisher',
      catalogNumber: 'K0171',
      lotNumber: '00123456',
      quantity: 15,
      unit: 'mL',
      minQuantity: 25,
      remarks: 'Running low - reorder soon',
      labId: lab.id,
      locationId: freezer.id,
      createdById: user2.id,
      lastUpdatedById: user2.id,
    },
  })

  console.log('✅ Created test items')

  // Create activity logs
  await prisma.activity.createMany({
    data: [
      {
        type: 'MEMBER_JOINED',
        description: `${user1.name} created lab ${lab.name}`,
        labId: lab.id,
        userId: user1.id,
      },
      {
        type: 'MEMBER_JOINED',
        description: `${user2.name} joined the lab`,
        labId: lab.id,
        userId: user2.id,
      },
      {
        type: 'ITEM_CREATED',
        description: `${user1.name} added ${item1.name}`,
        metadata: { itemId: item1.id },
        labId: lab.id,
        userId: user1.id,
      },
      {
        type: 'ITEM_CREATED',
        description: `${user1.name} added ${item2.name}`,
        metadata: { itemId: item2.id },
        labId: lab.id,
        userId: user1.id,
      },
      {
        type: 'ITEM_CREATED',
        description: `${user2.name} added ${item3.name}`,
        metadata: { itemId: item3.id },
        labId: lab.id,
        userId: user2.id,
      },
    ],
  })

  console.log('✅ Created activity logs')
  console.log('\n🎉 Seed data created successfully!')
  console.log('\n📝 Test Credentials:')
  console.log('   Admin: admin@omicsvault.com / password123')
  console.log('   Researcher: researcher@omicsvault.com / password123')
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
