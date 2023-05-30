import {
    MiddlewareConsumer,
    Module,
    NestModule,
} from "@nestjs/common";

import { CustomerController } from "./controller/customer.controller";
import { StatusController } from "./controller/status.controller";
import { SSOMiddleWare } from "./middleware/sso.middleware";
import { KeycloakProvider } from "./provider/keycloak.provider";
import { RedisProvider } from "./provider/redis.provider";
import { CustomerRepository } from "./repository/customer.repository";

@Module({
    imports: [],
    controllers: [
        CustomerController,
        StatusController,
    ],
    providers: [
        CustomerRepository,
        KeycloakProvider,
        RedisProvider,
    ],
})
export class AppModule implements NestModule {

    configure(consumer: MiddlewareConsumer) {
        consumer.apply(SSOMiddleWare)
            .exclude('status')
            .forRoutes('*');
    }

}
