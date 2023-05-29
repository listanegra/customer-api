import type { FactoryProvider } from "@nestjs/common";

import Redis, { RedisOptions } from "ioredis";

const REDIS_URI = process.env['REDIS_URI'] || 'redis://localhost:6379';
const REDIS_URL = new URL(REDIS_URI);

export const RedisProvider: FactoryProvider<Redis> = {
    provide: Redis,
    useFactory: async () => {
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
