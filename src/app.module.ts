import { Module } from "@nestjs/common";

import { StatusController } from "./controller/status.controller";

@Module({
    imports: [],
    controllers: [
        StatusController,
    ],
    providers: [],
})
export class AppModule {

}
