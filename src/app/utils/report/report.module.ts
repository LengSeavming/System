// ===========================================================================>> Core Library
import { Module } from '@nestjs/common';

// ===========================================================================>> Costom Library
import { JsReportService } from 'src/app/services/js-report.service';
import { ReportController } from './report.controller';
import { ReportService } from './report.service';

@Module({
    controllers: [ReportController],
    providers: [ReportService, JsReportService],
    imports: []
})
export class ReportModule { }
