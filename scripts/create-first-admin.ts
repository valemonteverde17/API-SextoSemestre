import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { UsersService } from '../src/users/users.service';
import * as bcrypt from 'bcrypt';

/**
 * Script para crear el primer usuario administrador
 * 
 * USO:
 * npm run create-admin
 * 
 * O directamente:
 * npx ts-node scripts/create-first-admin.ts
 */

async function bootstrap() {
  console.log('🚀 Iniciando creación del primer administrador...\n');

  const app = await NestFactory.createApplicationContext(AppModule);
  const usersService = app.get(UsersService);

  try {
    // Verificar si ya existe un admin
    const existingAdmins = await usersService['usersModel']
      .find({ role: 'admin' })
      .exec();

    if (existingAdmins.length > 0) {
      console.log('⚠️  Ya existe al menos un administrador en el sistema:');
      existingAdmins.forEach((admin) => {
        console.log(`   - ${admin.user_name} (${admin.email}) - Status: ${admin.status}`);
      });
      console.log('\n❌ No se creará un nuevo administrador.');
      console.log('💡 Si necesitas activar un admin existente, usa MongoDB Compass.\n');
      await app.close();
      return;
    }

    // Datos del primer admin
    const adminData = {
      user_name: 'admin',
      password: 'Admin123!',
      email: 'admin@cibereduca.com',
      role: 'admin',
      status: 'active', // ⚠️ IMPORTANTE: Se crea directamente como active
      profile: {
        fullName: 'Administrador Principal',
        bio: 'Primer administrador del sistema',
      },
      permissions: {
        canReview: false,
        canManageUsers: true,
      },
    };

    // Hashear password
    const hashedPassword = await bcrypt.hash(adminData.password, 10);

    // Crear admin directamente en la base de datos
    const admin = await usersService['usersModel'].create({
      ...adminData,
      password: hashedPassword,
    });

    console.log('✅ ¡Administrador creado exitosamente!\n');
    console.log('📋 Detalles del administrador:');
    console.log(`   Username: ${admin.user_name}`);
    console.log(`   Email: ${admin.email}`);
    console.log(`   Password: ${adminData.password}`);
    console.log(`   Role: ${admin.role}`);
    console.log(`   Status: ${admin.status}`);
    console.log(`   ID: ${admin._id}\n`);
    
    console.log('🔐 Credenciales para login:');
    console.log(`   POST http://localhost:3000/auth/login`);
    console.log(`   Body: {`);
    console.log(`     "user_name": "${admin.user_name}",`);
    console.log(`     "password": "${adminData.password}"`);
    console.log(`   }\n`);
    
    console.log('⚠️  IMPORTANTE: Cambia la contraseña después del primer login!\n');

  } catch (error) {
    console.error('❌ Error al crear el administrador:', error.message);
    if (error.code === 11000) {
      console.error('💡 El username "admin" ya existe. Usa otro username o elimina el existente.\n');
    }
  } finally {
    await app.close();
  }
}

bootstrap();
