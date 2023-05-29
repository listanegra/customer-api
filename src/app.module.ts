import {
    MiddlewareConsumer,
    Module,
    NestModule,
} from "@nestjs/common";

import { StatusController } from "./controller/status.controller";
import { SSOMiddleWare } from "./middleware/sso.middleware";
import { KeycloakProvider } from "./provider/keycloak.provider";

@Module({
    imports: [],
    controllers: [
        StatusController,
    ],
    providers: [
        KeycloakProvider,
    ],
})
export class AppModule implements NestModule {

    configure(consumer: MiddlewareConsumer) {
        consumer.apply(SSOMiddleWare)
            .exclude('status')
            .forRoutes('*');
    }

}
