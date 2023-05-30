import type { NestExpressApplication } from "@nestjs/platform-express";

import "dotenv/config";
import "reflect-metadata";

import { NestFactory } from "@nestjs/core";
import {
    Logger,
    ValidationPipe,
} from "@nestjs/common";

import { MainModule } from "./module/main.module";

NestFactory.create<NestExpressApplication>(MainModule)
    .then(async (app) => {
        app.disable('x-powered-by');
        app.useGlobalPipes(new ValidationPipe());

        return app.listen(3000);
    })
    .then((server) => {
        Logger.log('Customer API is ready and running');
        Logger.log(JSON.stringify(server.address()));
    });
