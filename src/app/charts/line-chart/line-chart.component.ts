import { Component, OnDestroy, OnInit } from '@angular/core';
import { TemperatureService } from '../../service/temperature/temperature.service';
import { Temperature } from 'src/app/interface/temperature';
import type { ECharts, EChartsOption } from 'echarts';
import { Subscription } from 'rxjs';
import { SelectItem, MessageService } from 'primeng/api';
import { TemperatureMinMaxMean } from '../../interface/temperature-min-max-mean';

@Component({
  selector: 'app-line-chart',
  templateUrl: './line-chart.component.html',
  styleUrls: ['./line-chart.component.scss'],
})
export class LineChartComponent implements OnInit, OnDestroy {
  public rangeDates: Date[] = [new Date()]; // initializing calendar's choice
  public lineChartOptions!: EChartsOption;
  public temperatureGroupedData: {
    minTemperatures: number[][];
    maxTemperatures: number[][];
    meanTemperatures: number[][];
  } = {
    minTemperatures: [],
    maxTemperatures: [],
    meanTemperatures: [],
  };

  public lineChartSelectedOption: string = 'live';
  public readonly lineChartListOptions: SelectItem[] = [
    { label: 'Live Data', value: 'live' },
    { label: 'Last 24 hours', value: 'day' },
    { label: 'Past 7 Days', value: '7days' },
    { label: 'Past 30 Days', value: '30days' },
    { label: 'Past Year', value: 'year' },
  ];
  private lineChartTemperatureSubscription!: Subscription;
  private startOfTheDate!: Date;
  private intervalId: any;
  private lineChart!: ECharts;
  private static readonly MILLISECONDS_IN_HOUR = 60 * 60 * 1000;
  private static readonly MILLISECONDS_IN_DAY =
    24 * LineChartComponent.MILLISECONDS_IN_HOUR;

  constructor(
    private temperatureService: TemperatureService,
    private messageService: MessageService
  ) {}

  public async ngOnInit(): Promise<void> {
    this.initializeOptions();
    this.initializeStartOfTheDate();
    await this.waitUntilChartInitialized();
    this.onOptionChange();
  }

  ngOnDestroy(): void {
    this.unsubscribeFromTemperatureSubscription();
    this.stopLiveTemperatureInterval();
  }

  public onDateRangeSelect(): void {
    this.lineChartSelectedOption = '';
    this.stopLiveTemperatureInterval();
    this.unsubscribeFromTemperatureSubscription();
    this.lineChart?.showLoading();
    this.clearTemperatureGroupedData();

    if (this.rangeDates[1] === null) {
      this.lineChartTemperatureSubscription = this.temperatureService
        .getTemperaturesFromDate(this.rangeDates[0])
        .subscribe((temperatures: TemperatureMinMaxMean) => {
          this.temperatureGroupedData.minTemperatures =
            temperatures.minTemperatures.map((temperature: Temperature) => {
              const timestamp = new Date(temperature.time).getTime();
              return [timestamp, temperature.temperature];
            });

          this.temperatureGroupedData.maxTemperatures =
            temperatures.maxTemperatures.map((temperature: Temperature) => {
              const timestamp = new Date(temperature.time).getTime();
              return [timestamp, temperature.temperature];
            });

          this.temperatureGroupedData.meanTemperatures =
            temperatures.meanTemperatures.map((temperature: Temperature) => {
              const timestamp = new Date(temperature.time).getTime();
              return [timestamp, temperature.temperature];
            });

          if (
            this.temperatureGroupedData.minTemperatures.length == 0 ||
            this.temperatureGroupedData.meanTemperatures.length == 0 ||
            this.temperatureGroupedData.maxTemperatures.length == 0
          ) {
            this.messageService.add({
              severity: 'warn',
              summary: 'No data found',
              detail: `No data found for date ${this.rangeDates[0].toLocaleDateString()}.`,
            });
          }

          this.updateChartWithTemperatureData();
        });
    } else {
      this.lineChartTemperatureSubscription = this.temperatureService
        .getGroupedTemperaturesBetweenDate(
          this.rangeDates[0],
          this.rangeDates[1]
        )
        .subscribe((temperatures: TemperatureMinMaxMean) => {
          this.temperatureGroupedData.minTemperatures =
            temperatures.minTemperatures.map((temperature: Temperature) => {
              const timestamp = new Date(temperature.time).getTime();
              return [timestamp, temperature.temperature];
            });

          this.temperatureGroupedData.maxTemperatures =
            temperatures.maxTemperatures.map((temperature: Temperature) => {
              const timestamp = new Date(temperature.time).getTime();
              return [timestamp, temperature.temperature];
            });

          this.temperatureGroupedData.meanTemperatures =
            temperatures.meanTemperatures.map((temperature: Temperature) => {
              const timestamp = new Date(temperature.time).getTime();
              return [timestamp, temperature.temperature];
            });

          if (
            this.temperatureGroupedData.minTemperatures.length == 0 ||
            this.temperatureGroupedData.meanTemperatures.length == 0 ||
            this.temperatureGroupedData.maxTemperatures.length == 0
          ) {
            this.messageService.add({
              severity: 'warn',
              summary: 'No data found',
              detail: `No data found between dates \n ${this.rangeDates[0].toLocaleDateString()} and ${this.rangeDates[1].toLocaleDateString()}.`,
            });
          }

          this.updateChartWithTemperatureData();
        });
    }
  }

  public onOptionChange(): void {
    this.unsubscribeFromTemperatureSubscription();
    this.clearTemperatureGroupedData();
    this.lineChart?.showLoading();
    this.rangeDates = [new Date()];
    this.stopLiveTemperatureInterval();

    switch (this.lineChartSelectedOption) {
      case 'live':
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
  private clearTemperatureGroupedData(): void {
    this.temperatureGroupedData = {
      minTemperatures: [],
      maxTemperatures: [],
      meanTemperatures: [],
    };
  }
  private getLiveTemperature(): void {
    this.unsubscribeFromTemperatureSubscription();

    this.lineChartTemperatureSubscription = this.temperatureService
      .getTemperaturesFromDate(this.startOfTheDate)
      .subscribe((temperatureGroupedData: TemperatureMinMaxMean) => {
        const mappedMinTemperatures =
          temperatureGroupedData.minTemperatures.map(
            (temperature: Temperature) => {
              const timestamp = new Date(temperature.time).getTime();
              return [timestamp, temperature.temperature];
            }
          );

        const mappedMaxTemperatures =
          temperatureGroupedData.maxTemperatures.map(
            (temperature: Temperature) => {
              const timestamp = new Date(temperature.time).getTime();
              return [timestamp, temperature.temperature];
            }
          );

        const mappedMeanTemperatures =
          temperatureGroupedData.meanTemperatures.map(
            (temperature: Temperature) => {
              const timestamp = new Date(temperature.time).getTime();
              return [timestamp, temperature.temperature];
            }
          );

        this.temperatureGroupedData.minTemperatures = mappedMinTemperatures;
        this.temperatureGroupedData.maxTemperatures = mappedMaxTemperatures;
        this.temperatureGroupedData.meanTemperatures = mappedMeanTemperatures;

        this.updateChartWithTemperatureData();
      });
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
      .getGroupedTemperaturesBetweenDate(startDate, endDate)
      .subscribe((temperatures: TemperatureMinMaxMean) => {
        this.temperatureGroupedData.minTemperatures =
          temperatures.minTemperatures.map((temperature: Temperature) => {
            const timestamp = new Date(temperature.time).getTime();
            return [timestamp, temperature.temperature];
          });

        this.temperatureGroupedData.maxTemperatures =
          temperatures.maxTemperatures.map((temperature: Temperature) => {
            const timestamp = new Date(temperature.time).getTime();
            return [timestamp, temperature.temperature];
          });

        this.temperatureGroupedData.meanTemperatures =
          temperatures.meanTemperatures.map((temperature: Temperature) => {
            const timestamp = new Date(temperature.time).getTime();
            return [timestamp, temperature.temperature];
          });

        this.updateChartWithTemperatureData();
      });
  }

  private initializeStartOfTheDate(): void {
    this.startOfTheDate = new Date();
    this.startOfTheDate.setHours(0, 0, 0, 0);
  }

  private updateChartWithTemperatureData(): void {
    this.lineChart.setOption({
      series: [
        {
          name: 'LiveTemperature',
          type: 'line',
          showSymbol: false,
          data: [],
        },
        {
          name: 'MinTemperature',
          type: 'line',
          showSymbol: false,
          areaStyle: {},
          data: this.temperatureGroupedData.minTemperatures,
        },
        {
          name: 'MaxTemperature',
          type: 'line',
          showSymbol: false,
          areaStyle: {},
          data: this.temperatureGroupedData.maxTemperatures,
        },
        {
          name: 'MeanTemperature',
          type: 'line',
          showSymbol: false,
          areaStyle: {},
          data: this.temperatureGroupedData.meanTemperatures,
        },
      ],
      legend: {
        show: true,
        data: [
          {
            name: 'MinTemperature',
          },
          {
            name: 'MeanTemperature',
          },
          {
            name: 'MaxTemperature',
          },
        ],
      },
    });

    this.lineChart?.hideLoading();
  }

  private initializeOptions(): void {
    this.lineChartOptions = {
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
          name: 'MinTemperature',
          type: 'line',
          showSymbol: false,
          areaStyle: {},
          data: this.temperatureGroupedData.minTemperatures,
        },
        {
          name: 'MaxTemperature',
          type: 'line',
          showSymbol: false,
          areaStyle: {},
          data: this.temperatureGroupedData.maxTemperatures,
        },
        {
          name: 'MeanTemperature',
          type: 'line',
          showSymbol: false,
          areaStyle: {},
          data: this.temperatureGroupedData.meanTemperatures,
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
