import {
    Body,
    Controller,
    Get,
    HttpException,
    HttpStatus,
    Inject,
    Param,
    Post,
    Put,
} from "@nestjs/common";

import { Customer } from "../model/customer.model";
import { RepositoryKeyAlreadyExistsError } from "../repository/abstract.repository";
import { CustomerRepository } from "../repository/customer.repository";

class CustomerNotFoundError extends HttpException {

    constructor() {
        super('Cliente não encontrado', HttpStatus.NOT_FOUND);
    }

}

@Controller('/customers')
export class CustomerController {

    constructor(
        @Inject(CustomerRepository)
        private readonly repository: CustomerRepository,
    ) { }

    @Post()
    public create(
        @Body()
        customer: Customer,
    ) {
        return this.repository.save(customer);
    }

    @Get(':id')
    public async read(
        @Param('id')
        id: string,
    ) {
        const data = await this.repository.find(id);
        if (data === null) {
            throw new CustomerNotFoundError;
        }

        return data;
    }

    @Put(':id')
    public async update(
        @Param('id')
        id: string,
        @Body()
        customer: Customer,
    ) {
        const data = await this.repository.update(id, customer)
            .catch(error => {
                if (error instanceof RepositoryKeyAlreadyExistsError) {
                    throw new HttpException('Cliente já existe', HttpStatus.CONFLICT);
                }

                throw error;
            });

        if (data === null) {
            throw new CustomerNotFoundError;
        }

        return data;
    }

}
