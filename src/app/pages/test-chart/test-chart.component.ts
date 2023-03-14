import { Component, OnDestroy, OnInit } from '@angular/core';
import { TemperatureService } from '../../service/temperature/temperature.service';
import { Temperature } from 'src/app/interface/temperature';
import type { ECharts, EChartsOption } from 'echarts';
import { Subscription } from 'rxjs';
import { SelectItem } from 'primeng/api';

@Component({
  selector: 'app-test-chart',
  templateUrl: './test-chart.component.html',
  styleUrls: ['./test-chart.component.scss'],
})
export class TestChartComponent implements OnInit, OnDestroy {
  public optionsLineChart!: EChartsOption;
  public temperatureData: any = [];
  public lineChart!: ECharts;
  public selectedOption: string = 'live';
  public readonly dropdownOptions: SelectItem[] = [
    { label: 'Live Data', value: 'live' },
    { label: 'Today', value: 'day' },
    { label: 'Past 7 Days', value: '7days' },
    { label: 'Past 30 Days', value: '30days' },
    { label: 'Past Year', value: 'year' },
  ];
  private temperatureSubscription!: Subscription;
  private lastTimeOfFetchedData!: Date;
  private intervalId: any;
  private chartInitializedPromise!: Promise<void>;

  constructor(private temperatureService: TemperatureService) {}

  public async ngOnInit(): Promise<void> {
    this.initializeOptions();
    this.initializeLastTimeOfFetchedData();
    await this.waitUntilChartInitialized();
    this.onOptionChange();
  }

  ngOnDestroy(): void {
    this.unsubscribeFromTemperatureSubscription();
  }

  public onOptionChange(): void {
    this.unsubscribeFromTemperatureSubscription();
    this.lineChart?.showLoading();
    this.temperatureData = [];
    this.stopLiveTemperatureInterval();

    switch (this.selectedOption) {
      case 'live':
        this.initializeLastTimeOfFetchedData(); // set last time of fetched data to start of the day
        this.getLiveTemperature();
        this.startLiveTemperatureInterval();
        break;
      case 'day':
        this.loadDataForPeriod(24 * 60 * 60 * 1000); // 24 hours in milliseconds
        break;
      case '7days':
        this.loadDataForPeriod(7 * 24 * 60 * 60 * 1000); // 7 days in milliseconds
        break;
      case '30days':
        this.loadDataForPeriod(30 * 24 * 60 * 60 * 1000); // 30 days in milliseconds
        break;
      case 'year':
        this.loadDataForPeriod(365 * 24 * 60 * 60 * 1000); // 365 days in milliseconds
        break;
      default:
        this.startLiveTemperatureInterval();
        break;
    }
  }
  private getLiveTemperature(): void {
    this.unsubscribeFromTemperatureSubscription();

    this.temperatureSubscription = this.temperatureService
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
    if (this.temperatureSubscription) {
      this.temperatureSubscription.unsubscribe();
    }
  }

  private loadDataForPeriod(period: number): void {
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - period);

    this.unsubscribeFromTemperatureSubscription();

    this.temperatureSubscription = this.temperatureService
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
          type: 'line',
          showSymbol: false,
          areaStyle: {},
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
      darkMode: true,
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
          showSymbol: false,
          areaStyle: {},
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
