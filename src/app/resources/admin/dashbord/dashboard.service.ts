import { Injectable } from '@nestjs/common';

@Injectable()
export class DashboardService {

  
    async Hello(){
        return 'Hello from dashboard service Admin!';
    }
}
