import { HttpServer, HttpStatus, INestApplication, NestMiddleware, ValidationPipe } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import type { NextFunction, Request, Response } from "express";
import request from "supertest";

import { MainModule } from "./main.module";
import type { Customer } from "../model/customer.model";
import type { IndexedModel } from "../repository/abstract.repository";

// Disable JWT validation
jest.mock('../middleware/sso.middleware.ts', () => ({
    SSOMiddleWare: class SSOMiddleWare implements NestMiddleware<Request, Response> {
        public async use(_req: Request, _res: Response, next: NextFunction): Promise<void> {
            next();
        }
    },
}));

describe('Customers module E2E testing', () => {
    let app: INestApplication;
    let server: HttpServer;

    beforeAll(async () => {
        const module = await Test.createTestingModule({
            imports: [MainModule],
        }).compile();

        app = module.createNestApplication()
        app.useGlobalPipes(new ValidationPipe());
        await app.init();

        server = app.getHttpServer();
    });

    it('Should return 201 on POST /customers', () => {
        const customer: Customer = {
            document: '123.456.789-10',
            name: 'Test Customer',
        };

        return request(server)
            .post('/customers')
            .send(customer)
            .expect(HttpStatus.CREATED)
            .expect((res) => {
                expect(res.body).toHaveProperty('id');
                expect(res.body).toMatchObject(customer);
            });
    });

    it('Should return 400 on POST /customers', () => {
        const customer: Partial<Customer> = {
            name: 'Test Customer',
        };

        return request(server)
            .post('/customers')
            .send(customer)
            .expect(HttpStatus.BAD_REQUEST)
            .expect(res => {
                const expected = [
                    'document must be a string',
                    'document should not be empty',
                ];

                expect(res.body).toHaveProperty('message');
                expect(res.body.message).toEqual(expected);
            });
    });

    it('Should return 200 on GET /customers/:id', async () => {
        const customer: Customer = {
            document: '999.888.777-66',
            name: 'New Customer',
        };

        const { body } = await request(server)
            .post('/customers')
            .send(customer);

        const customerId = body['id'];
        return request(server)
            .get('/customers/' + customerId)
            .expect(HttpStatus.OK)
            .expect((res) => {
                expect(res.body).toEqual(body);
            });
    });

    it('Should return 404 on GET /customers/:id', async () => {
        return request(server)
            .get('/customers/340b8d5b-8d54-4044-a5c1-cc14a40795c4')
            .expect(HttpStatus.NOT_FOUND);
    });

    it('Should return 200 on PUT /customers/:id', async () => {
        const customer = await request(server)
            .post('/customers')
            .send(<Customer>{
                document: '111.222.333-44',
                name: 'Update Customer',
            })
            .then(({ body }) => <IndexedModel<Customer>>body);

        customer.name = 'New Updated Name';

        return request(server)
            .put('/customers/' + customer.id)
            .send(customer)
            .expect(HttpStatus.OK)
            .expect((res) => {
                expect(res.body).toEqual(customer);
            });
    });

    it('Should return 400 on PUT /customers/:id', async () => {
        const customer = await request(server)
            .post('/customers')
            .send(<Customer>{
                document: '111.222.333-44',
                name: 'New Customer',
            })
            .then(({ body }) => <IndexedModel<Customer>>body);

        const { id } = customer;
        return request(server)
            .put('/customers/' + id)
            .send({ id, name: 'Invalid update' })
            .expect(HttpStatus.BAD_REQUEST)
            .expect((res) => {
                const expected = [
                    'document must be a string',
                    'document should not be empty',
                ];

                expect(res.body).toHaveProperty('message');
                expect(res.body.message).toEqual(expected);
            });
    });

    it('Should return 404 on PUT /customers/:id', async () => {
        const customer: IndexedModel<Customer> = {
            id: 'a803800d-fcb4-4482-85e3-73d5587815ee',
            document: '111.222.333-44',
            name: 'Ghost Customer',
        };

        return request(server)
            .put('/customers/' + customer.id)
            .send(customer)
            .expect(HttpStatus.NOT_FOUND);
    });

    it('Should return 409 on PUT /customers/:id', async () => {
        const customerA = await request(server)
            .post('/customers')
            .send({
                document: '111.222.333-44',
                name: 'Customer A',
            })
            .then(({ body }) => <IndexedModel<Customer>>body);

        const customerB = await request(server)
            .post('/customers')
            .send({
                document: '111.222.333-44',
                name: 'Customer B',
            })
            .then(({ body }) => <IndexedModel<Customer>>body);

        return request(server)
            .put('/customers/' + customerA.id)
            .send({ ...customerA, id: customerB.id })
            .expect(HttpStatus.CONFLICT);
    });

    it('Should return 200 on PUT /customers/:id and update customer id', async () => {
        const id = 'e479094d-c3de-48f1-ac29-6f6d88c3c726';

        const customer = await request(server)
            .post('/customers')
            .send(<Customer>{
                document: '111.222.333-44',
                name: 'New Customer',
            })
            .then(({ body }) => <IndexedModel<Customer>>body);

        return request(server)
            .put('/customers/' + customer.id)
            .send({ ...customer, id })
            .expect(HttpStatus.OK)
            .expect((res) => {
                expect(res.body).toEqual({ ...customer, id });
                expect(res.body['id']).not.toBe(customer.id);
            });
    });

    afterAll(() => app.close());
});
