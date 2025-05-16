import { Module } from "@nestjs/common";
import { DashboardController } from "./dashboard.controller";

import { JsReportService } from "@app/services/js-report.service";
import { DashboardService } from "./dashboard.service";

@Module({
  controllers: [DashboardController],
  providers: [DashboardService, JsReportService],
})
export class DashboardModule {}
