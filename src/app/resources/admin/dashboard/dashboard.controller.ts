// ===========================================================================>> Custom Library
import { Controller, Get, Query } from "@nestjs/common";
import { DashboardService } from "./dashboard.service";

// ===========================================================================>> Custom Library

@Controller()
export class DashboardController {
  constructor(private readonly _service: DashboardService) {}

  @Get()
  async getStaticData(
    @Query("today") today?: string,
    @Query("yesterday") yesterday?: string,
    @Query("thisWeek") thisWeek?: string,
    @Query("thisMonth") thisMonth?: string
  ) {
    return await this._service.findStaticData({
      today,
      yesterday,
      thisWeek,
      thisMonth,
    });
  }
  @Get("/cashier")
  async getCashierAndTotalSale(
    @Query("today") today?: string,
    @Query("yesterday") yesterday?: string,
    @Query("thisWeek") thisWeek?: string,
    @Query("thisMonth") thisMonth?: string
  ) {
    return await this._service.findCashierAndTotalSale({
      today,
      yesterday,
      thisWeek,
      thisMonth,
    });
  }

  @Get("/product-type")
  async getProductTypeWithProductHaveUsed(
    @Query("thisWeek") thisWeek?: string,
    @Query("thisMonth") thisMonth?: string,
    @Query("threeMonthAgo") threeMonthAgo?: string,
    @Query("sixMonthAgo") sixMonthAgo?: string
  ) {
    return await this._service.findProductTypeWithProductHaveUsed({
      thisWeek,
      thisMonth,
      threeMonthAgo,
      sixMonthAgo,
    });
  }

  @Get("/data-sale")
  async getDataSaleDayOfWeek(
    @Query("thisWeek") thisWeek?: string,
    @Query("thisMonth") thisMonth?: string,
    @Query("threeMonthAgo") threeMonthAgo?: string,
    @Query("sixMonthAgo") sixMonthAgo?: string
  ) {
    return await this._service.findDataSaleDayOfWeek({
      thisWeek,
      thisMonth,
      threeMonthAgo,
      sixMonthAgo,
    });
  }
}
