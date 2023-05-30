import type { FactoryProvider } from "@nestjs/common";

import { ConfigService } from "@nestjs/config";
import Redis, { RedisOptions } from "ioredis";

export const RedisProvider: FactoryProvider<Redis> = {
    provide: Redis,
    inject: [ConfigService],
    useFactory: async (config: ConfigService) => {
        const REDIS_URI = config.get<string>('REDIS_URI', 'redis://localhost:6379');
        const REDIS_URL = new URL(REDIS_URI);

        const {
            hostname,
            port,
            username,
            password,
        } = REDIS_URL;

        const options: RedisOptions = {
            lazyConnect: true,
            host: hostname,
            port: +port,
        };

        if (username && password) {
            Object.assign(options, { username, password });
        }

        const redis = new Redis(options);
        await redis.connect();

        return redis;
    },
};
