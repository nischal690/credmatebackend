import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  getHello(): { status: string; message: string } {
    return {
      status: 'success',
      message: 'Server is running!'
    };
  }

  @Get('health')
  healthCheck(): { status: string; timestamp: string } {
    return {
      status: 'healthy',
      timestamp: new Date().toISOString()
    };
  }
}
