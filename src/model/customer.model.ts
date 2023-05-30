import { IsNotEmpty, IsString } from "class-validator";

export class Customer {

    @IsNotEmpty()
    @IsString()
    document!: string;

    @IsNotEmpty()
    @IsString()
    name!: string;

}
