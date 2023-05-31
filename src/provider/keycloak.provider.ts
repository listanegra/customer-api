import { FactoryProvider, Logger } from "@nestjs/common";

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

        const keyCloakURL = new URL(KEYCLOAK_ENDPOINT);
        keyCloakURL.pathname = `/auth/realms/${KEYCLOAK_REALM}`;
        keyCloakURL.search = '';

        const baseURL = keyCloakURL.toString();
        const http = axios.create({ baseURL });

        const response = await http.get('/protocol/openid-connect/certs')
            .catch((error: Error) => {
                Logger.error(error, error.stack, 'KeycloakProvider');
                return { status: 400, data: null };
            });

        if (response.status === 200) {
            const keystore = await JWK.asKeyStore(response.data);
            return new KeycloakService(keystore, baseURL, KEYCLOAK_CLIENT_ID);
        }

        throw new Error(`Error fetching keystore from '${KEYCLOAK_ENDPOINT}'`);
    },
};
