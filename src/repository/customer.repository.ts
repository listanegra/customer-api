import { Injectable } from "@nestjs/common";

import { AbstractRepository } from "./abstract.repository";
import type { Customer } from "../model/customer.model";

@Injectable()
export class CustomerRepository extends AbstractRepository<Customer> {
    protected override readonly prefix = 'customer';
}
