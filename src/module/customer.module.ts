import { Module } from "@nestjs/common";

import { CustomerController } from "../controller/customer.controller";
import { CustomerRepository } from "../repository/customer.repository";

@Module({
    controllers: [CustomerController],
    providers: [CustomerRepository],
})
export class CustomerModule { }
