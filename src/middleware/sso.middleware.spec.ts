import {
    Controller,
    FactoryProvider,
    Get,
    HttpServer,
    HttpStatus,
    INestApplication,
    MiddlewareConsumer,
    Module,
    NestModule,
} from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { JWK, JWS } from "node-jose";
import request from "supertest";

import { SSOMiddleWare } from "./sso.middleware";
import { KeycloakService } from "../service/keycloak.service";

const KEYCLOAK_ISSUER = 'middleware';
const KEYCLOAK_CLIENT_ID = 'middleware';

const keystore = JWK.createKeyStore();

const KeycloakProvider: FactoryProvider<KeycloakService> = {
    provide: KeycloakService,
    useFactory: async () => {
        await keystore.generate('RSA', 2048);
        return new KeycloakService(keystore, KEYCLOAK_ISSUER, KEYCLOAK_CLIENT_ID);
    },
};

// @ts-ignore
@Controller('/test')
class TestController {

    // @ts-ignore
    @Get()
    public test() {
        return { hello: 'world' };
    }

}

// @ts-ignore
@Module({
    controllers: [TestController],
    providers: [KeycloakProvider],
})
class MiddlewareTestModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(SSOMiddleWare)
            .forRoutes('*');
    }
}

const createJWT = async (key: JWK.Key) => {
    const payload = {
        exp: (Date.now() + (5 * 60 * 1000)) / 1000,
        iss: KEYCLOAK_ISSUER,
        clientId: KEYCLOAK_CLIENT_ID,
    };

    const signature = await JWS.createSign({ format: 'compact' }, key)
        .update(JSON.stringify(payload))
        .final();

    return String(signature);
};

describe('Authentication middleware test', () => {
    let app: INestApplication;
    let server: HttpServer;

    beforeAll(async () => {
        const module = await Test.createTestingModule({
            imports: [MiddlewareTestModule],
        }).compile();

        app = module.createNestApplication()
        await app.init();

        server = app.getHttpServer();
    });

    it('Should return status 401 for missing Authorization header', () => {
        return request(server)
            .get('/test')
            .expect(HttpStatus.UNAUTHORIZED);
    });

    it('Should return status 401 for invalid Authorization header', () => {
        return request(server)
            .get('/test')
            .set('Authorization', 'Basic 123')
            .expect(HttpStatus.UNAUTHORIZED);
    });

    it('Should return status 401 for invalid token', async () => {
        const key = await JWK.createKey('RSA', 2048, {});
        const token = await createJWT(key);

        return request(server)
            .get('/test')
            .set('Authorization', `Bearer ${token}`)
            .expect(HttpStatus.UNAUTHORIZED);
    });

    it('Should return status 200 for valid token', async () => {
        const key = keystore.all()[0]!;
        const token = await createJWT(key);

        return request(server)
            .get('/test')
            .set('Authorization', `Bearer ${token}`)
            .expect(HttpStatus.OK);
    });

    afterAll(() => app.close());
});
