import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  // Hash password
  const password = await bcrypt.hash("123as", 10);

  // Seed data untuk User (selalu create data baru tanpa memeriksa email)
  const user = await prisma.user.create({
    data: {
      email: "rendy@gmail.com", // Email unik
      name: "Rendy", // Nama lengkap
      username: "admin", // Username unik
      password: password, // Password yang telah di-hash
      role: "superadmin", // Role sebagai ADMIN
      bidang: "IT", // Bidang kerja
      image: null, // Gambar opsional
      status: true, // Status aktif
    },
  });

  console.log({ user });
}

// Eksekusi Seeder
main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
