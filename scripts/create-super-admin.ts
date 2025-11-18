import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { UsersService } from '../src/users/users.service';
import * as bcrypt from 'bcrypt';

/**
 * Script para crear el Super Administrador del sistema
 * 
 * USO:
 * npm run create-super-admin
 * 
 * O directamente:
 * npx ts-node scripts/create-super-admin.ts
 */

async function bootstrap() {
  console.log('🚀 Iniciando creación del Super Administrador...\n');

  const app = await NestFactory.createApplicationContext(AppModule);
  const usersService = app.get(UsersService);

  try {
    // Verificar si ya existe un super admin
    const existingSuperAdmins = await usersService['usersModel']
      .find({ is_super: true })
      .exec();

    if (existingSuperAdmins.length > 0) {
      console.log('⚠️  Ya existe al menos un Super Administrador en el sistema:');
      existingSuperAdmins.forEach((superAdmin) => {
        console.log(`   - ${superAdmin.user_name} (${superAdmin.email}) - Status: ${superAdmin.status}`);
      });
      console.log('\n❌ No se creará un nuevo Super Administrador.');
      console.log('💡 Si necesitas activar un super admin existente, usa MongoDB Compass.\n');
      await app.close();
      return;
    }

    // Datos del Super Admin
    const superAdminData = {
      user_name: 'developers',
      password: 'password',
      email: 'developers@cibereduca.mx',
      role: 'admin', // Rol base es admin
      is_super: true, // Flag especial para super admin
      status: 'active', // Se crea directamente como active
      profile: {
        fullName: 'Super Administrador - Developers',
        bio: 'Super Administrador del sistema CiberEduca',
      },
      permissions: {
        canReview: true,
        canManageUsers: true,
      },
    };

    // Hashear password
    const hashedPassword = await bcrypt.hash(superAdminData.password, 10);

    // Crear super admin directamente en la base de datos
    const superAdmin = await usersService['usersModel'].create({
      ...superAdminData,
      password: hashedPassword,
    });

    console.log('✅ ¡Super Administrador creado exitosamente!\n');
    console.log('📋 Detalles del Super Administrador:');
    console.log(`   Username: ${superAdmin.user_name}`);
    console.log(`   Email: ${superAdmin.email}`);
    console.log(`   Password: ${superAdminData.password}`);
    console.log(`   Role: ${superAdmin.role}`);
    console.log(`   Is Super: ${superAdmin.is_super}`);
    console.log(`   Status: ${superAdmin.status}`);
    console.log(`   ID: ${superAdmin._id}\n`);
    
    console.log('🔐 Credenciales para login:');
    console.log(`   POST http://localhost:3000/auth/login`);
    console.log(`   Body: {`);
    console.log(`     "user_name": "${superAdmin.user_name}",`);
    console.log(`     "password": "${superAdminData.password}"`);
    console.log(`   }\n`);
    
    console.log('⚠️  IMPORTANTE:');
    console.log('   - Este usuario tiene acceso TOTAL al sistema');
    console.log('   - Puede gestionar todas las organizaciones');
    console.log('   - Puede crear/editar/eliminar cualquier contenido');
    console.log('   - Cambia la contraseña después del primer login!\n');

  } catch (error) {
    console.error('❌ Error al crear el Super Administrador:', error.message);
    if (error.code === 11000) {
      console.error('💡 El username "developers" ya existe. Usa otro username o elimina el existente.\n');
    }
  } finally {
    await app.close();
  }
}

bootstrap();
