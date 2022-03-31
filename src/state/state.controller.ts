import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

const packageInfo = require('../../package.json');

@Controller('/')
@ApiTags('状态')
export class StateController {
  @Get()
  getState(): object {
    return {
      message: 'Welcome access LumbaShark API!',
      data: {
        state: 'ok',
        server: {
          version: packageInfo.version,
          description: packageInfo.description,
          author: packageInfo.author,
          license: packageInfo.license,
        },
      },
    };
  }
}
