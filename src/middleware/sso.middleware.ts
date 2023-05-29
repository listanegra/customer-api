import type {
    NextFunction,
    Request,
    Response,
} from "express";

import {
    HttpException,
    HttpStatus,
    Inject,
    NestMiddleware,
} from "@nestjs/common";

import { Keycloak } from "../model/keycloak.model";

class AuthenticationError extends HttpException {

    constructor() {
        super('Unauthorized', HttpStatus.UNAUTHORIZED);
    }

}

export class SSOMiddleWare implements NestMiddleware<Request, Response> {

    constructor(
        @Inject(Keycloak)
        private readonly keycloak: Keycloak,
    ) { }

    public async use(req: Request, _res: Response, next: NextFunction): Promise<void> {
        const authorization = req.header("Authorization");
        if (!authorization || !authorization.startsWith('Bearer ')) {
            throw new AuthenticationError;
        }

        const [, token] = authorization.trim().split(/\s+/, 2);
        const isTokenValid = await this.keycloak.validate(token);

        if (!isTokenValid) {
            throw new AuthenticationError;
        }

        next();
    }

}
