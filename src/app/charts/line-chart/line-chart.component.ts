import { Component, OnDestroy, OnInit } from '@angular/core';
import { TemperatureService } from '../../service/temperature/temperature.service';
import { Temperature } from 'src/app/interface/temperature';
import type { ECharts, EChartsOption } from 'echarts';
import { Subscription } from 'rxjs';
import { SelectItem } from 'primeng/api';

@Component({
  selector: 'app-line-chart',
  templateUrl: './line-chart.component.html',
  styleUrls: ['./line-chart.component.scss'],
})
export class LineChartComponent implements OnInit, OnDestroy {
  public optionsLineChart!: EChartsOption;
  public temperatureData: any = [];
  public lineChartSelectedOption: string = 'live';
  public readonly lineChartDropdownOptions: SelectItem[] = [
    { label: 'Live Data', value: 'live' },
    { label: 'Last 24 hours', value: 'day' },
    { label: 'Past 7 Days', value: '7days' },
    { label: 'Past 30 Days', value: '30days' },
    { label: 'Past Year', value: 'year' },
  ];
  private lineChartTemperatureSubscription!: Subscription;
  private lastTimeOfFetchedData!: Date;
  private intervalId: any;
  private lineChart!: ECharts;
  private static readonly MILLISECONDS_IN_HOUR = 60 * 60 * 1000;
  private static readonly MILLISECONDS_IN_DAY =
    24 * LineChartComponent.MILLISECONDS_IN_HOUR;

  constructor(private temperatureService: TemperatureService) {}

  public async ngOnInit(): Promise<void> {
    this.initializeOptions();
    this.initializeLastTimeOfFetchedData();
    await this.waitUntilChartInitialized();
    this.onOptionChange();
  }

  ngOnDestroy(): void {
    this.unsubscribeFromTemperatureSubscription();
    this.stopLiveTemperatureInterval();
  }

  public onOptionChange(): void {
    this.unsubscribeFromTemperatureSubscription();
    this.lineChart?.showLoading();
    this.temperatureData = [];
    this.stopLiveTemperatureInterval();

    switch (this.lineChartSelectedOption) {
      case 'live':
        this.initializeLastTimeOfFetchedData(); // set last time of fetched data to start of the day
        this.getLiveTemperature();
        this.startLiveTemperatureInterval();
        break;
      case 'day':
        this.loadDataForPeriod(LineChartComponent.MILLISECONDS_IN_DAY);
        break;
      case '7days':
        this.loadDataForPeriod(7 * LineChartComponent.MILLISECONDS_IN_DAY);
        break;
      case '30days':
        this.loadDataForPeriod(30 * LineChartComponent.MILLISECONDS_IN_DAY);
        break;
      case 'year':
        this.loadDataForPeriod(365 * LineChartComponent.MILLISECONDS_IN_DAY);
        break;
      default:
        this.startLiveTemperatureInterval();
        break;
    }
  }
  private getLiveTemperature(): void {
    this.unsubscribeFromTemperatureSubscription();

    this.lineChartTemperatureSubscription = this.temperatureService
      .getTemperaturesSince(this.lastTimeOfFetchedData)
      .subscribe((temperatures: Temperature[]) => {
        const mappedTemperatures = temperatures.map(
          (temperature: Temperature) => {
            const timestamp = new Date(temperature.time).getTime();
            return [timestamp, temperature.temperature];
          }
        );

        this.temperatureData.push(...mappedTemperatures);
        this.updateChartWithTemperatureData();
      });
    this.lastTimeOfFetchedData = new Date();
  }

  private unsubscribeFromTemperatureSubscription(): void {
    if (this.lineChartTemperatureSubscription) {
      this.lineChartTemperatureSubscription.unsubscribe();
    }
  }

  private loadDataForPeriod(period: number): void {
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - period);

    this.unsubscribeFromTemperatureSubscription();

    this.lineChartTemperatureSubscription = this.temperatureService
      .getTemperaturesBetweenDates(startDate, endDate)
      .subscribe((temperatures: Temperature[]) => {
        this.temperatureData = temperatures.map((temperature: Temperature) => {
          const timestamp = new Date(temperature.time).getTime();
          return [timestamp, temperature.temperature];
        });
        this.updateChartWithTemperatureData();
      });
  }

  private updateChartWithTemperatureData(): void {
    this.lineChart.setOption({
      series: [
        {
          name: 'Temperature',
          data: this.temperatureData,
        },
      ],
    });
    this.lineChart?.hideLoading();
  }

  private initializeLastTimeOfFetchedData(): void {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    this.lastTimeOfFetchedData = now;
  }

  private initializeOptions(): void {
    this.optionsLineChart = {
      title: {
        text: 'Temperature',
      },
      tooltip: {},
      legend: {
        backgroundColor: 'lightBlue',
      },
      xAxis: {
        type: 'time',
        splitLine: {
          show: true,
        },
      },
      darkMode: 'auto',
      yAxis: {
        type: 'value',
        splitLine: {
          show: false,
        },
      },
      series: [
        {
          name: 'Temperature',
          type: 'line',
          showSymbol: true,
          data: this.temperatureData,
        },
      ],
      dataZoom: [
        {
          show: true,
          type: 'slider',
        },
        {
          type: 'inside',
        },
      ],
      axisPointer: {
        animation: true,
        show: true,
      },
    };
  }

  private stopLiveTemperatureInterval(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
    }
  }

  private startLiveTemperatureInterval(): void {
    this.lineChart?.hideLoading();
    this.intervalId = setInterval(() => {
      this.getLiveTemperature();
    }, 10000);
  }

  public onLineChartInit(chart: any): void {
    this.lineChart = chart;
  }

  private async waitUntilChartInitialized(): Promise<void> {
    return new Promise<void>((resolve) => {
      if (this.lineChart) {
        resolve();
      } else {
        this.onLineChartInit = (chart: any) => {
          this.lineChart = chart;

          resolve();
        };
      }
    });
  }
}
