import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Default admin user (password: admin123)
  const hashedPassword = await bcrypt.hash('admin123', 10);
  await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      passwordHash: hashedPassword,
      fullName: 'Quản trị viên',
      email: 'admin@parking.com',
      role: 'admin',
    },
  });

  // Vehicle Types
  const vehicleTypes = [
    { name: 'Xe máy', description: 'Xe máy, xe gắn máy', hourlyRate: 5000, dailyRate: 20000, monthlyRate: 200000 },
    { name: 'Ô tô con', description: 'Ô tô dưới 9 chỗ', hourlyRate: 20000, dailyRate: 100000, monthlyRate: 1500000 },
    { name: 'Ô tô lớn', description: 'Ô tô từ 9 chỗ trở lên, xe tải', hourlyRate: 30000, dailyRate: 150000, monthlyRate: 2500000 },
    { name: 'Xe đạp', description: 'Xe đạp các loại', hourlyRate: 2000, dailyRate: 10000, monthlyRate: 100000 },
  ];

  for (const vt of vehicleTypes) {
    await prisma.vehicleType.upsert({
      where: { id: vehicleTypes.indexOf(vt) + 1 },
      update: {},
      create: vt,
    });
  }

  // Parking Zones
  const zones = [
    { name: 'Khu A', description: 'Khu vực xe máy', totalSpots: 50 },
    { name: 'Khu B', description: 'Khu vực ô tô con', totalSpots: 30 },
    { name: 'Khu C', description: 'Khu vực ô tô lớn', totalSpots: 20 },
    { name: 'Khu D', description: 'Khu vực VIP', totalSpots: 10 },
  ];

  for (const zone of zones) {
    await prisma.parkingZone.upsert({
      where: { id: zones.indexOf(zone) + 1 },
      update: {},
      create: zone,
    });
  }

  // Parking Spots
  const spotConfigs = [
    { zoneId: 1, prefix: 'A', count: 50, type: 'standard' },
    { zoneId: 2, prefix: 'B', count: 30, type: 'standard' },
    { zoneId: 3, prefix: 'C', count: 20, type: 'standard' },
    { zoneId: 4, prefix: 'D', count: 10, type: 'vip' },
  ];

  for (const config of spotConfigs) {
    for (let i = 1; i <= config.count; i++) {
      const spotNumber = `${config.prefix}${String(i).padStart(2, '0')}`;
      await prisma.parkingSpot.upsert({
        where: { zoneId_spotNumber: { zoneId: config.zoneId, spotNumber } },
        update: {},
        create: { zoneId: config.zoneId, spotNumber, spotType: config.type },
      });
    }
  }

  // Parking Packages
  const packages = [
    { name: 'Vé tháng xe máy', vehicleTypeId: 1, durationDays: 30, price: 200000, description: 'Gói gửi xe máy theo tháng' },
    { name: 'Vé quý xe máy', vehicleTypeId: 1, durationDays: 90, price: 550000, description: 'Gói gửi xe máy theo quý' },
    { name: 'Vé năm xe máy', vehicleTypeId: 1, durationDays: 365, price: 2000000, description: 'Gói gửi xe máy theo năm' },
    { name: 'Vé tháng ô tô con', vehicleTypeId: 2, durationDays: 30, price: 1500000, description: 'Gói gửi ô tô con theo tháng' },
    { name: 'Vé quý ô tô con', vehicleTypeId: 2, durationDays: 90, price: 4000000, description: 'Gói gửi ô tô con theo quý' },
    { name: 'Vé năm ô tô con', vehicleTypeId: 2, durationDays: 365, price: 15000000, description: 'Gói gửi ô tô con theo năm' },
    { name: 'Vé tháng ô tô lớn', vehicleTypeId: 3, durationDays: 30, price: 2500000, description: 'Gói gửi ô tô lớn theo tháng' },
  ];

  for (const pkg of packages) {
    await prisma.parkingPackage.upsert({
      where: { id: packages.indexOf(pkg) + 1 },
      update: {},
      create: pkg,
    });
  }

  console.log('Seed data created successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
