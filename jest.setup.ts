import type { FactoryProvider } from "@nestjs/common";

import { KeycloakService } from "./src/service/keycloak.service";

jest.mock('ioredis', () => jest.requireActual('ioredis-mock'));

// Fake KeycloakProvider
jest.mock('./src/provider/keycloak.provider.ts', () => ({
    get KeycloakProvider(): FactoryProvider {
        return ({
            provide: KeycloakService,
            useFactory: () => {
                return { validate: () => Promise.resolve(true) };
            },
        });
    },
}));
