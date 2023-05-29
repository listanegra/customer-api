import type { FactoryProvider } from "@nestjs/common";

import axios from "axios";
import { JWK } from "node-jose";

import { getEnvironmentVariables } from "../helper/getEnvironmentVariables.helper";
import { Keycloak } from "../model/keycloak.model";

const {
    KEYCLOAK_ENDPOINT,
    KEYCLOAK_CLIENT_ID,
    KEYCLOAK_REALM,
} = getEnvironmentVariables(
    'KEYCLOAK_ENDPOINT',
    'KEYCLOAK_CLIENT_ID',
    'KEYCLOAK_REALM',
);

const KEYCLOAK_BASE_URL = `${KEYCLOAK_ENDPOINT}/auth/realms/${KEYCLOAK_REALM}`;

const http = axios.create({
    baseURL: KEYCLOAK_BASE_URL,
    validateStatus: () => true,
});

export const KeycloakProvider: FactoryProvider<Keycloak> = {
    provide: Keycloak,
    useFactory: async () => {
        const response = await http.get('/protocol/openid-connect/certs');

        if (response.status === 200) {
            const keystore = await JWK.asKeyStore(response.data);
            return new Keycloak(keystore, KEYCLOAK_BASE_URL, KEYCLOAK_CLIENT_ID!);
        }

        throw new Error(`Error fetching keystore from '${KEYCLOAK_ENDPOINT}'`);
    },
};