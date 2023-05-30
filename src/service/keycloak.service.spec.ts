import { JWK, JWS } from "node-jose";

import { KeycloakService } from "./keycloak.service";

const KEYCLOAK_ISSUER = 'http://localhost:8080/keycloak';
const KEYCLOAK_CLIENT_ID = 'localhost';

const createJWT = async (key: JWK.Key, payload: Record<string, unknown>) => {
    if (!payload['exp']) {
        // Expires in 5 minutes
        const exp = (Date.now() + (5 * 60 * 1000)) / 1000;
        Object.assign(payload, { exp });
    }

    const signature = await JWS.createSign({ format: 'compact' }, key)
        .update(JSON.stringify(payload))
        .final();

    return String(signature);
};

describe('Keycloak validation service test', () => {
    it('Should reject empty token', async () => {
        const keystore = JWK.createKeyStore();
        const service = new KeycloakService(keystore, KEYCLOAK_ISSUER, KEYCLOAK_CLIENT_ID);

        expect(service.validate(''))
            .resolves.toBe(false);
    });
    it('Should accept token as valid', async () => {
        const keystore = JWK.createKeyStore();
        const key = await keystore.generate('RSA', 2048);

        const payload = {
            iss: KEYCLOAK_ISSUER,
            clientId: KEYCLOAK_CLIENT_ID,
        };
        const token = await createJWT(key, payload);

        const service = new KeycloakService(keystore, KEYCLOAK_ISSUER, KEYCLOAK_CLIENT_ID);

        expect(service.validate(token))
            .resolves.toBe(true);
    });
    it('Should reject token with invalid signature', async () => {
        const key = await JWK.createKey('RSA', 2048, {});

        const payload = {
            iss: KEYCLOAK_ISSUER,
            clientId: KEYCLOAK_CLIENT_ID,
        };
        const token = await createJWT(key, payload);

        const keystore = JWK.createKeyStore();
        await keystore.generate('RSA', 2048);

        const service = new KeycloakService(keystore, KEYCLOAK_ISSUER, KEYCLOAK_CLIENT_ID);

        expect(service.validate(token))
            .resolves.toBe(false);
    });
    it('Should reject expired token', async () => {
        const keystore = JWK.createKeyStore();
        const key = await keystore.generate('RSA', 2048);

        const payload = {
            iss: KEYCLOAK_ISSUER,
            clientId: KEYCLOAK_CLIENT_ID,
            // Expired 5 minutes ago
            exp: (Date.now() - (5 * 60 * 1000)) / 1000,
        };
        const token = await createJWT(key, payload);

        const service = new KeycloakService(keystore, KEYCLOAK_ISSUER, KEYCLOAK_CLIENT_ID);

        expect(service.validate(token))
            .resolves.toBe(false);
    });
    it('Should reject token with invalid issuer', async () => {
        const keystore = JWK.createKeyStore();
        const key = await keystore.generate('RSA', 2048);

        const payload = {
            iss: 'invalid',
            clientId: KEYCLOAK_CLIENT_ID,
        };
        const token = await createJWT(key, payload);

        const service = new KeycloakService(keystore, KEYCLOAK_ISSUER, KEYCLOAK_CLIENT_ID);

        expect(service.validate(token))
            .resolves.toBe(false);
    });
});
