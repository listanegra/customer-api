import { Test } from "@nestjs/testing";

import { StatusController } from "./status.controller";

describe('Status controller test', () => {
    it('Should return the server uptime', async () => {
        const module = await Test.createTestingModule({
            controllers: [StatusController],
        }).compile();

        const controller = module.get(StatusController);

        const now = process.uptime().toFixed(2);
        const { uptime } = controller.uptime();

        expect(uptime.toFixed(2)).toBe(now);
    });
});
