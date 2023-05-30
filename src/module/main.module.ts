import { ConfigModule } from '@nestjs/config';
import {
    Global,
    MiddlewareConsumer,
    Module,
    NestModule,
} from "@nestjs/common";

import { StatusController } from "../controller/status.controller";
import { SSOMiddleWare } from "../middleware/sso.middleware";
import { CustomerModule } from "../module/customer.module";
import { KeycloakProvider } from "../provider/keycloak.provider";
import { RedisProvider } from "../provider/redis.provider";

@Global()
@Module({
    imports: [
        ConfigModule.forRoot(),
        CustomerModule,
    ],
    controllers: [
        StatusController,
    ],
    providers: [
        KeycloakProvider,
        RedisProvider,
    ],
    exports: [
        RedisProvider,
    ],
})
export class MainModule implements NestModule {

    configure(consumer: MiddlewareConsumer) {
        consumer.apply(SSOMiddleWare)
            .exclude('status')
            .forRoutes('*');
    }

}
