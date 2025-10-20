import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
// import TypeOrmModule or DatabaseModule if you use TypeORM / raw pool, etc.
// import { TypeOrmModule } from '@nestjs/typeorm';
// import { User } from './users.entity';

@Module({
  imports: [
    // TypeOrmModule.forFeature([User]), // if you're using TypeORM
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService], // <-- MUST export so other modules (AuthModule) can inject it
})
export class UsersModule {}