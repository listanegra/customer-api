import { ConfigModule } from "@nestjs/config";
import { Test } from "@nestjs/testing";
import Axios from "axios";
import { JWK } from "node-jose";

jest.mock('axios', () => {
    const axios = jest.genMockFromModule<typeof Axios>('axios');
    axios.create = jest.fn(() => Axios);

    return axios;
});

const { KeycloakProvider } = jest.requireActual('./keycloak.provider');

describe('KeycloakService provider test', () => {
    const Config = ConfigModule.forFeature(() => ({
        KEYCLOAK_ENDPOINT: 'http://example.com/keycloak',
        KEYCLOAK_CLIENT_ID: 'none',
        KEYCLOAK_REALM: 'test',
    }));

    it('Should successfully return an instance', async () => {
        jest.spyOn(Axios, 'get').mockImplementationOnce(() => {
            const keystore = JWK.createKeyStore();

            return Promise.resolve({
                data: keystore.toJSON(),
                status: 200,
            });
        });

        await Test.createTestingModule({
            imports: [Config],
            providers: [KeycloakProvider],
        }).compile();
    });

    it('Should throw error while trying to instantiate', () => {
        jest.spyOn(Axios, 'get').mockImplementationOnce(() => {
            return Promise.reject(new Error);
        });

        return expect(() =>
            Test.createTestingModule({
                imports: [Config],
                providers: [KeycloakProvider],
            }).compile()
        ).rejects.toThrow(Error);
    });
});
