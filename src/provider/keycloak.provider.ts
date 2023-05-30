import type { FactoryProvider } from "@nestjs/common";

import axios from "axios";
import { ConfigService } from "@nestjs/config";
import { JWK } from "node-jose";

import { KeycloakService } from "../service/keycloak.service";

export const KeycloakProvider: FactoryProvider<KeycloakService> = {
    provide: KeycloakService,
    inject: [ConfigService],
    useFactory: async (config: ConfigService) => {
        const KEYCLOAK_ENDPOINT = config.getOrThrow<string>('KEYCLOAK_ENDPOINT');
        const KEYCLOAK_CLIENT_ID = config.getOrThrow<string>('KEYCLOAK_CLIENT_ID');
        const KEYCLOAK_REALM = config.getOrThrow<string>('KEYCLOAK_REALM');

        const KEYCLOAK_BASE_URL = `${KEYCLOAK_ENDPOINT}/auth/realms/${KEYCLOAK_REALM}`;

        const http = axios.create({
            baseURL: KEYCLOAK_BASE_URL,
            validateStatus: () => true,
        });

        const response = await http.get('/protocol/openid-connect/certs');

        if (response.status === 200) {
            const keystore = await JWK.asKeyStore(response.data);
            return new KeycloakService(keystore, KEYCLOAK_BASE_URL, KEYCLOAK_CLIENT_ID!);
        }

        throw new Error(`Error fetching keystore from '${KEYCLOAK_ENDPOINT}'`);
    },
};
