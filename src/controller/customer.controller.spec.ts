import { ConflictException, NotFoundException } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { Test } from "@nestjs/testing";
import RedisMock from "ioredis-mock";

import { CustomerController } from "./customer.controller";
import { CustomerRepository } from "../repository/customer.repository";
import { RedisProvider } from "../provider/redis.provider";

import type { Customer } from "../model/customer.model";
import type { IndexedModel } from "../repository/abstract.repository";

const getModule = async () => {
    return Test.createTestingModule({
        imports: [ConfigModule.forRoot()],
        controllers: [CustomerController],
        providers: [CustomerRepository, RedisProvider],
    }).compile();
};

describe('Customers controller test', () => {
    it('Should create fake customer', async () => {
        const module = await getModule();
        const controller = module.get(CustomerController);

        const data: Customer = {
            document: '123.456.789-10',
            name: 'Test',
        };

        const customer: IndexedModel<Customer> = {
            id: '1c4519b4-92f8-4118-803d-7ab4480c073e',
            ...data,
        };

        jest.spyOn(controller, 'create').mockImplementation(() => Promise.resolve(customer));

        expect(controller.create(data))
            .resolves.toBe(customer);
    });
    it('Should read fake customer', async () => {
        const module = await getModule();
        const controller = module.get(CustomerController);

        const customer: IndexedModel<Customer> = {
            id: '6be272bf-1729-4a6a-8f0e-0e0fd9cfffa4',
            document: '111.222.333-44',
            name: 'Fake Read',
        };

        jest.spyOn(controller, 'read').mockImplementation(() => Promise.resolve(customer));

        expect(controller.read(customer.id))
            .resolves.toBe(customer);
    });
    it('Should throw error if customer is not found', async () => {
        const module = await getModule();
        const controller = module.get(CustomerController);

        expect(controller.read('f35cab43-8f8d-418e-b2c8-bc8713f59395'))
            .rejects.toThrow(NotFoundException);
    });
    it('Should update fake customer', async () => {
        const module = await getModule();
        const controller = module.get(CustomerController);

        const data: Customer = {
            document: '999.888.777-66',
            name: 'Fake Update',
        };

        const customer: IndexedModel<Customer> = {
            id: '78cc44c3-ed40-4dc8-8545-a823047268f0',
            ...data,
        };

        jest.spyOn(controller, 'update').mockImplementation(() => Promise.resolve(customer));

        expect(controller.update(customer.id, data))
            .resolves.toBe(customer);
    });
    it('Should conflict existing id', async () => {
        const module = await getModule();
        const controller = module.get(CustomerController);

        const redis = module.get(RedisMock);
        jest.spyOn(redis, 'exists').mockImplementation(() => Promise.resolve(1));

        const customer: IndexedModel<Customer> = {
            id: 'eb2f867f-ec42-4ae9-bc60-6aa825ad5085',
            document: '999.888.777-66',
            name: 'Conflict Update',
        };

        // @ts-expect-error
        jest.spyOn(redis, 'hgetall').mockImplementation((key, callback) => {
            if (typeof key === 'string' && key.endsWith('_t')) {
                // @ts-expect-error
                return callback(null, { document: '1', name: '1' });
            }

            const { id: _, ..._customer } = customer;
            // @ts-expect-error
            return callback(null, _customer);
        });

        expect(controller.update('f36d7b5b-1fe1-4760-986e-3a021570a8b8', customer))
            .rejects.toThrow(ConflictException);
    });
    it('Should throw error if customer to be updated is not found', async () => {
        const module = await getModule();
        const controller = module.get(CustomerController);

        const customer: Customer = {
            document: '999.888.777-66',
            name: 'Not found Update',
        };

        expect(controller.update('c48b0b7e-104f-4a1f-afb6-7a7054394bee', customer))
            .rejects.toThrow(NotFoundException);
    });
    it('Should throw error on update promise catch', async () => {
        const module = await getModule();
        const controller = module.get(CustomerController);
        const redis = module.get(RedisMock);

        // @ts-expect-error
        jest.spyOn(redis, 'hgetall').mockImplementation((_key, callback) => callback(new Error(), undefined));

        expect(controller.update('throw me', <Customer>{}))
            .rejects.toThrow(Error);
    });
});
