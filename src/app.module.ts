import {
    MiddlewareConsumer,
    Module,
    NestModule,
} from "@nestjs/common";

import { StatusController } from "./controller/status.controller";
import { SSOMiddleWare } from "./middleware/sso.middleware";
import { KeycloakProvider } from "./provider/keycloak.provider";
import { RedisProvider } from "./provider/redis.provider";

@Module({
    imports: [],
    controllers: [
        StatusController,
    ],
    providers: [
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
