import {
    Controller,
    Get,
} from "@nestjs/common";

@Controller('/status')
export class StatusController {

    @Get()
    public uptime() {
        const uptime = process.uptime();
        return { uptime };
    }

}
