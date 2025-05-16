import { NgIf } from '@angular/common';
import {
    ChangeDetectorRef, Component, ElementRef, Input, OnChanges, OnInit, SimpleChanges, ViewChild
} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { SnackbarService } from 'helper/services/snack-bar/snack-bar.service';
import { ApexOptions, NgApexchartsModule } from 'ng-apexcharts';
import { DashbordService } from '../dashboards.service';

@Component({
    selector: 'cicle-chart',
    standalone: true,
    templateUrl: './template.html',
    styleUrls: ['./style.scss'],
    imports: [NgApexchartsModule, MatIconModule, NgIf],
})

export class CicleChartComponent implements OnInit, OnChanges {
    @Input() selectedDate: { thisWeek: string; thisMonth: string, threeMonthAgo: string, sixMonthAgo: string } | null = null;
    @ViewChild("chartContainer2", { read: ElementRef, static: false }) chartContainer!: ElementRef<HTMLDivElement>;

    chartOptions: Partial<ApexOptions> = {};

    constructor(
        private _cdr: ChangeDetectorRef,
        private _snackBarService: SnackbarService,
        private _cashierService: DashbordService
    ) { }

    ngOnInit(): void {
        if (this.selectedDate) {
            this._fetchProductData(
                this.selectedDate.thisWeek,
                this.selectedDate.thisMonth,
                this.selectedDate.threeMonthAgo,
                this.selectedDate.sixMonthAgo
            );
        } else {
            this._fetchProductData();
        }
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['selectedDate'] && this.selectedDate) {
            this._fetchProductData(
                this.selectedDate.thisWeek,
                this.selectedDate.thisMonth,
                this.selectedDate.threeMonthAgo,
                this.selectedDate.sixMonthAgo
            );
        }
    }

    private _fetchProductData(
        thisWeek?: string,
        thisMonth?: string,
        threeMonthAgo?: string,
        sixMonthAgo?: string

    ): void {
        const params = {
            thisWeek: thisWeek || undefined,
            thisMonth: thisMonth || undefined,
            threeMonthAgo: threeMonthAgo || undefined,
            sixMonthAgo: sixMonthAgo || undefined,
        };

        this._cashierService.getProductType(params).subscribe({
            next: (response: any) => {
                if (response && response.labels && response.data) {
                    this._updateChart(response.labels, response.data);

                } else {
                    this._snackBarService.openSnackBar('No data available', 'Info');
                }
            },
            error: (err) => {
                const errorMessage = err.error?.message || 'Error fetching product data';
                this._snackBarService.openSnackBar(errorMessage, 'Error');
            }
        });
    }

    private _updateChart(labels: string[], data: number[]): void {
        const totalSum = data.map(Number).reduce((a, b) => a + b, 0);
        this.chartOptions = {
            chart: {
                type: 'donut',
                height: 400,
            },
            series: data.map(Number),
            labels: labels.map((label, index) => `${label} (${data[index]})`),
            legend: {
                position: 'bottom',
                horizontalAlign: 'center',
                offsetY: -140,
                fontSize: '14px',
                fontFamily: 'Arial, sans-serif',
            },
            colors: [
                '#a3e635', '#16a34a', '#d9f99d', '#86efac',
                '#81D4FA', '#80DEEA', '#A5D6A7', '#80CBC4', '#B39DDB'
            ],
            plotOptions: {
                pie: {
                    startAngle: -90,
                    endAngle: 90,
                    expandOnClick: true,
                    donut: {
                        size: '65%',
                        labels: {
                            show: true,
                            total: {
                                show: true,
                                label: 'Total',
                                formatter: () => `${totalSum}`
                            }
                        }
                    }
                }
            },
            tooltip: {
                enabled: true,
                y: {
                    formatter: (val) => `${val}`,
                }
            },
            dataLabels: {
                enabled: true,
                formatter: function (val, opts) {
                    return opts.w.config.series[opts.seriesIndex];
                },
                style: {
                    fontSize: '14px',
                    fontFamily: 'Arial, sans-serif',
                }
            }
        };

        this._cdr.detectChanges(); // Trigger change detection to update the chart
    }
}
