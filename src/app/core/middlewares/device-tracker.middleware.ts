// src/middleware/device-tracker.middleware.ts
import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import * as requestIp from 'request-ip';
import * as useragent from 'useragent';

@Injectable()
export class DeviceTrackerMiddleware implements NestMiddleware {
    use(req: Request, res: Response, next: NextFunction) {
        
        // Get IP address
        const ip = requestIp.getClientIp(req);

        // Parse User-Agent string
        const agent = useragent.parse(req.headers['user-agent']);
        const isMobile = req.headers['x-flutter'] === 'true';
        const platform = isMobile
            ? 'Mobile'
            : agent.device.type || 'Web';
        // Extract relevant data
        const deviceInfo = {
            ip,
            browser: agent.toAgent(),
            os: agent.os.toString(),
            platform: platform,
            timestamp: new Date(),
        };
        req['deviceInfo'] = deviceInfo;
        next();
    }
}
