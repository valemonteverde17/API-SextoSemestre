import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { TopicsModule } from './topics/topics.module';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [TopicsModule, UsersModule, MongooseModule.forRoot('mongodb+srv://MarioGO:ContraseñaSegura1234567@cluster0.2vqlb.mongodb.net/')],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
