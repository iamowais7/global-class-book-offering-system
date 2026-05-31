import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './common/entities/user.entity';
import { Offering } from './common/entities/offering.entity';
import { Session } from './common/entities/session.entity';
import { Booking } from './common/entities/booking.entity';
import { AuthModule } from './auth/auth.module';
import { TeachersModule } from './teachers/teachers.module';
import { ParentsModule } from './parents/parents.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const databaseUrl = config.get<string>('DATABASE_URL');

        if (databaseUrl) {
          return {
            type: 'postgres',
            url: databaseUrl,
            entities: [User, Offering, Session, Booking],
            synchronize: true,
            ssl: { rejectUnauthorized: false },
            timezone: 'UTC',
          };
        }

        return {
          type: 'postgres',
          host: config.get('DB_HOST', 'localhost'),
          port: config.get<number>('DB_PORT', 5432),
          username: config.get('DB_USERNAME', 'postgres'),
          password: config.get('DB_PASSWORD', '1234'),
          database: config.get('DB_NAME', 'class_booking'),
          entities: [User, Offering, Session, Booking],
          synchronize: config.get('NODE_ENV') !== 'production',
          logging: config.get('NODE_ENV') === 'development',
          timezone: 'UTC',
        };
      },
    }),
    AuthModule,
    TeachersModule,
    ParentsModule,
  ],
})
export class AppModule {}
