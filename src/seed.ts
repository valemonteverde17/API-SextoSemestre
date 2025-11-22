import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { UsersService } from './users/users.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const usersService = app.get(UsersService);

  try {
    const adminUser = await usersService.createAdmin({
      user_name: 'admin',
      password: 'password123',
      role: 'admin', // This will be ignored by validator in DTO but used/bypassed in service
    });
    console.log('Admin user checked/created:', adminUser.user_name);
  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    await app.close();
  }
}
bootstrap();
