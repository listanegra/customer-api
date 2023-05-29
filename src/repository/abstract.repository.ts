import { randomUUID } from "node:crypto";

import { Inject } from "@nestjs/common";
import Redis from "ioredis";
import JSONCache from "redis-json";

type IndexedModel<T> = { id: string } & T;

export class RepositoryKeyAlreadyExistsError extends Error { }

export abstract class AbstractRepository<T> {

    protected abstract prefix: string;

    constructor(
        @Inject(Redis)
        private readonly redis: Redis,
    ) { }

    private get _prefix() {
        return this.prefix + ':';
    }

    private getCache(): JSONCache<T> {
        return new JSONCache<T>(this.redis, { prefix: this._prefix });
    }

    public async find(id: string): Promise<IndexedModel<T> | null> {
        const db = this.getCache();
        const data = await db.get(id);

        if (data === undefined)
            return null;

        return { id, ...data };
    }

    public async save(object: T): Promise<IndexedModel<T>> {
        const id = randomUUID();

        const db = this.getCache();
        await db.set(id, object);

        return { id, ...object };
    }

    public async update(id: string, object: Partial<IndexedModel<T>>): Promise<IndexedModel<T> | null> {
        const db = this.getCache();
        const stored = await db.get(id);

        if (stored === undefined) {
            return null;
        }

        const transaction = this.redis.multi();
        const { id: newId, ...data } = { ...stored, ...object };

        if (newId && newId !== id) {
            const keyExists = await this.redis.exists(this._prefix + newId);

            if (keyExists) {
                throw new RepositoryKeyAlreadyExistsError;
            }

            await db.del(id, { transaction });
            id = newId;
        }

        await db.set(id, <T>data, { transaction });
        await transaction.exec();

        return { id, ...<T>data };
    }

}
