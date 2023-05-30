import { Logger } from "@nestjs/common";
import { JWK, JWS } from "node-jose";

export class KeycloakService {

    private readonly verifier: JWS.Verifier;

    constructor(
        private readonly keystore: JWK.KeyStore,
        private readonly issuer: string,
        private readonly clientId: string,
    ) {
        this.verifier = JWS.createVerify(this.keystore);
    }

    public async validate(token: string | undefined): Promise<boolean> {
        if (!token) {
            return false;
        }

        try {
            const data = await this.verifier.verify(token);
            const payload = JSON.parse(data.payload.toString());
            const expiresIn = +payload.exp * 1000;

            if (isNaN(expiresIn) || Date.now() > expiresIn) {
                return false;
            }

            if (payload.iss !== this.issuer) {
                return false;
            }

            const clientId = payload.aud || payload.clientId;
            return clientId === this.clientId;
        } catch (error) {
            if (error instanceof Error) {
                Logger.error(error, error.stack, KeycloakService.name);
            }
        }

        return false;
    }

};
