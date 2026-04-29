import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotesModule } from './notes/notes.module';
import { CategoriesModule } from './categories/categories.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get('DATABASE_HOST', 'localhost'),
        port: config.get<number>('DATABASE_PORT', 5432),
        username: config.get('DATABASE_USER', 'notes_user'),
        password: config.get('DATABASE_PASSWORD', 'notes_pass'),
        database: config.get('DATABASE_NAME', 'notes_db'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: true, // auto-create schema in dev
      }),
      inject: [ConfigService],
    }),
    NotesModule,
    CategoriesModule,
  ],
})
export class AppModule {}
