"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const user_entity_1 = require("./common/entities/user.entity");
const offering_entity_1 = require("./common/entities/offering.entity");
const session_entity_1 = require("./common/entities/session.entity");
const booking_entity_1 = require("./common/entities/booking.entity");
const auth_module_1 = require("./auth/auth.module");
const teachers_module_1 = require("./teachers/teachers.module");
const parents_module_1 = require("./parents/parents.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            typeorm_1.TypeOrmModule.forRootAsync({
                imports: [config_1.ConfigModule],
                inject: [config_1.ConfigService],
                useFactory: (config) => {
                    const databaseUrl = config.get('DATABASE_URL');
                    if (databaseUrl) {
                        return {
                            type: 'postgres',
                            url: databaseUrl,
                            entities: [user_entity_1.User, offering_entity_1.Offering, session_entity_1.Session, booking_entity_1.Booking],
                            synchronize: true,
                            ssl: { rejectUnauthorized: false },
                            timezone: 'UTC',
                        };
                    }
                    return {
                        type: 'postgres',
                        host: config.get('DB_HOST', 'localhost'),
                        port: config.get('DB_PORT', 5432),
                        username: config.get('DB_USERNAME', 'postgres'),
                        password: config.get('DB_PASSWORD', '1234'),
                        database: config.get('DB_NAME', 'class_booking'),
                        entities: [user_entity_1.User, offering_entity_1.Offering, session_entity_1.Session, booking_entity_1.Booking],
                        synchronize: config.get('NODE_ENV') !== 'production',
                        logging: config.get('NODE_ENV') === 'development',
                        timezone: 'UTC',
                    };
                },
            }),
            auth_module_1.AuthModule,
            teachers_module_1.TeachersModule,
            parents_module_1.ParentsModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map