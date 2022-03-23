import {Module} from '@nestjs/common';
import {UsersService} from './users.service';
import { UsersController } from './users.controller';
import { UsersApiController } from './users.api.controller';

@Module({
    imports: [],
    providers: [UsersService],
    exports: [UsersService],
    controllers: [UsersController, UsersApiController]
})
export class UsersModule {
}
