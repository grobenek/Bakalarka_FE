import { Component, OnDestroy, OnInit } from '@angular/core';
import { ECharts, EChartsOption } from 'echarts';
import { Subscription } from 'rxjs';
import { MessageService, SelectItem, TreeNode } from 'primeng/api';
import { ElectricService } from '../../service/electric/electric.service';
import {
  Current,
  ElectricQuantities,
  Voltage,
} from '../../interface/electric-quantities';
import { ElectricPhase } from '../../interface/electric-phase';
import { ElectricDataMinMaxMean } from '../../interface/electric-data';
import { GridFrequency } from '../../interface/electric-quantities';
@Component({
  selector: 'app-line-chart',
  templateUrl: './line-chart.component.html',
  styleUrls: ['./line-chart.component.scss'],
})
export class LineChartComponent implements OnInit, OnDestroy {
  public rangeDates: Date[] = [new Date()]; // initializing calendar's choice
  public lineChartOptions!: EChartsOption;
  public electricGroupedData: ElectricDataMinMaxMean = {
    minCurrents: [],
    meanCurrents: [],
    maxCurrents: [],
    minVoltages: [],
    meanVoltages: [],
    maxVoltages: [],
    minGridFrequencies: [],
    meanGridFrequencies: [],
    maxGridFrequencies: [],
  };

  public lineChartSelectedDataOptions: TreeNode[] = [{ data: 'CurrentL1' }];
  public lineChartSelectedDateOption: string = 'year';
  public readonly lineChartListDateOptions: SelectItem[] = [
    { label: 'Live Data', value: 'live' },
    { label: 'Last 24 hours', value: 'day' },
    { label: 'Past 7 Days', value: '7days' },
    { label: 'Past 30 Days', value: '30days' },
    { label: 'Past Year', value: 'year' },
  ];
  private electricQuantities: ElectricQuantities[] = [
    ElectricQuantities.CURRENT,
  ];
  private currentPhases: ElectricPhase[] = [ElectricPhase.L1];
  private voltagePhases: ElectricPhase[] = [];
  private lineChartElectricSubscription!: Subscription;
  private intervalId: any;
  private lineChart!: ECharts;
  private static readonly MILLISECONDS_IN_HOUR = 60 * 60 * 1000;
  private static readonly MILLISECONDS_IN_DAY =
    24 * LineChartComponent.MILLISECONDS_IN_HOUR;

  constructor(
    private electricService: ElectricService,
    private messageService: MessageService
  ) {}

  public async ngOnInit(): Promise<void> {
    this.initializeOptions();
    await this.waitUntilChartInitialized();
    this.onDateOptionChange();
  }

  public ngOnDestroy(): void {
    this.unsubscribeFromElectricSubscription();
    this.stopLiveTemperatureInterval();
  }

  public onDateRangeSelect(): void {
    this.lineChartSelectedDateOption = '';
    this.stopLiveTemperatureInterval();
    this.unsubscribeFromElectricSubscription();
    this.lineChart?.showLoading();
    this.clearElectricGroupeData();

    if (this.rangeDates[1] === null) {
      this.lineChartElectricSubscription = this.electricService
        .getAllElectricQuantitiesFromDate(
          this.rangeDates[0],
          this.electricQuantities,
          this.currentPhases,
          this.voltagePhases
        )
        .subscribe((data: ElectricDataMinMaxMean) => {
          this.electricGroupedData = data;
          this.updateChartWithElectricData();

          if (this.isElectricDataEmpty(data)) {
            this.messageService.add({
              severity: 'warn',
              summary: 'No data found',
              detail: `No data found for date \n ${this.rangeDates[0].toLocaleDateString()}.`,
            });
          }
        });
    } else {
      this.lineChartElectricSubscription = this.electricService
        .getGroupedElectricQuantitiesBetweenDate(
          this.rangeDates[0],
          this.rangeDates[1],
          this.electricQuantities,
          this.currentPhases,
          this.voltagePhases
        )
        .subscribe((data: ElectricDataMinMaxMean) => {
          this.electricGroupedData = data;
          this.updateChartWithElectricData();

          if (this.isElectricDataEmpty(data)) {
            this.messageService.add({
              severity: 'warn',
              summary: 'No data found',
              detail: `No data found between dates \n ${this.rangeDates[0].toLocaleDateString()} and ${this.rangeDates[1].toLocaleDateString()}.`,
            });
          }
        });
    }
  }

  public onSelectedNodesChange(data: TreeNode[]) {
    this.lineChartSelectedDataOptions = data;

    this.electricQuantities = [];
    this.currentPhases = [];
    this.voltagePhases = [];

    data.forEach((node: TreeNode) => {
      switch (node.data) {
        case 'CurrentL1':
          this.currentPhases.push(ElectricPhase.L1);
          if (this.electricQuantities.includes(ElectricQuantities.CURRENT)) {
            return;
          }

          this.electricQuantities.push(ElectricQuantities.CURRENT);
          break;

        case 'CurrentL2': {
          this.currentPhases.push(ElectricPhase.L2);
          if (this.electricQuantities.includes(ElectricQuantities.CURRENT)) {
            return;
          }

          this.electricQuantities.push(ElectricQuantities.CURRENT);
          break;
        }

        case 'CurrentL3': {
          this.currentPhases.push(ElectricPhase.L3);
          if (this.electricQuantities.includes(ElectricQuantities.CURRENT)) {
            return;
          }

          this.electricQuantities.push(ElectricQuantities.CURRENT);
          break;
        }

        case 'VoltageL1': {
          this.voltagePhases.push(ElectricPhase.L1);
          if (this.electricQuantities.includes(ElectricQuantities.VOLTAGE)) {
            return;
          }

          this.electricQuantities.push(ElectricQuantities.VOLTAGE);
          break;
        }

        case 'VoltageL2': {
          this.voltagePhases.push(ElectricPhase.L2);
          if (this.electricQuantities.includes(ElectricQuantities.VOLTAGE)) {
            return;
          }

          this.electricQuantities.push(ElectricQuantities.VOLTAGE);
          break;
        }

        case 'VoltageL3': {
          this.voltagePhases.push(ElectricPhase.L3);
          if (this.electricQuantities.includes(ElectricQuantities.VOLTAGE)) {
            return;
          }

          this.electricQuantities.push(ElectricQuantities.VOLTAGE);
          break;
        }

        case 'Grid frequency': {
          if (this.electricQuantities.includes(ElectricQuantities.CURRENT)) {
            return;
          }

          this.electricQuantities.push(ElectricQuantities.GRID_FREQUENCY);
          break;
        }

        default:
          break;
      }
    });
  }

  public onDateOptionChange(): void {
    this.unsubscribeFromElectricSubscription();
    this.clearElectricGroupeData();
    this.lineChart?.showLoading();
    this.rangeDates = [new Date()];
    this.stopLiveTemperatureInterval();

    switch (this.lineChartSelectedDateOption) {
      case 'live':
        // this.getLiveTemperature();
        // this.startLiveTemperatureInterval();
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
        // this.startLiveTemperatureInterval();
        break;
    }
  }

  private fetchAndUpdateDataBetweenDates(startDate: Date, endDate: Date): void {
    this.unsubscribeFromElectricSubscription();
    this.clearElectricGroupeData();
    this.lineChartElectricSubscription = this.electricService
      .getGroupedElectricQuantitiesBetweenDate(
        startDate,
        endDate,
        this.electricQuantities,
        this.currentPhases,
        this.voltagePhases
      )
      .subscribe((data: ElectricDataMinMaxMean) => {
        this.electricGroupedData = data;

        this.updateChartWithElectricData();
        this.lineChart.hideLoading();
      });
  }

  private clearElectricGroupeData(): void {
    this.electricGroupedData = {
      minCurrents: [],
      meanCurrents: [],
      maxCurrents: [],
      minVoltages: [],
      meanVoltages: [],
      maxVoltages: [],
      minGridFrequencies: [],
      meanGridFrequencies: [],
      maxGridFrequencies: [],
    };
  }

  private loadDataForPeriod(period: number): void {
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - period);

    this.unsubscribeFromElectricSubscription();

    this.fetchAndUpdateDataBetweenDates(startDate, endDate);
  }

  private isElectricDataEmpty(data: ElectricDataMinMaxMean): boolean {
    if (!data) {
      return true;
    }

    return Object.values(data).every(
      (arr) => arr === null || arr === undefined || arr.length === 0
    );
  }

  private updateChartWithElectricData(): void {
    let series: any[] = [];

    switch (this.electricQuantities?.at(0)) {
      case ElectricQuantities.CURRENT: {
        if (this.currentPhases)
          if (this.currentPhases.includes(ElectricPhase.L1)) {
            series.push(
              {
                name: 'Min L1 current',
                type: 'line',
                showSymbol: false,
                areaStyle: {},
                data: this.electricGroupedData.minCurrents
                  .filter((data: Current) => data.phase === ElectricPhase.L1)
                  .map((data: Current) => [
                    new Date(data.time).getTime(),
                    data.current,
                  ]),
              },
              {
                name: 'Mean L1 current',
                type: 'line',
                showSymbol: false,
                areaStyle: {}, // spravit aj pri zmene datumu aj dat
                data: this.electricGroupedData.meanCurrents
                  .filter((data: Current) => data.phase === ElectricPhase.L1)
                  .map((data: Current) => [
                    new Date(data.time).getTime(),
                    data.current,
                  ]),
              },
              {
                name: 'Max L1 current',
                type: 'line',
                showSymbol: false,
                areaStyle: {},
                data: this.electricGroupedData.maxCurrents
                  .filter((data: Current) => data.phase === ElectricPhase.L1)
                  .map((data: Current) => [
                    new Date(data.time).getTime(),
                    data.current,
                  ]),
              }
            );
          }

        if (this.currentPhases.includes(ElectricPhase.L2)) {
          series.push(
            {
              name: 'Min L2 current',
              type: 'line',
              showSymbol: false,
              areaStyle: {},
              data: this.electricGroupedData.minCurrents
                .filter((data: Current) => data.phase === ElectricPhase.L2)
                .map((data: Current) => [
                  new Date(data.time).getTime(),
                  data.current,
                ]),
            },
            {
              name: 'Mean L2 current',
              type: 'line',
              showSymbol: false,
              areaStyle: {},
              data: this.electricGroupedData.meanCurrents
                .filter((data: Current) => data.phase === ElectricPhase.L2)
                .map((data: Current) => [
                  new Date(data.time).getTime(),
                  data.current,
                ]),
            },
            {
              name: 'Max L2 current',
              type: 'line',
              showSymbol: false,
              areaStyle: {},
              data: this.electricGroupedData.maxCurrents
                .filter((data: Current) => data.phase === ElectricPhase.L2)
                .map((data: Current) => [
                  new Date(data.time).getTime(),
                  data.current,
                ]),
            }
          );
        }

        if (this.currentPhases.includes(ElectricPhase.L3)) {
          series.push(
            {
              name: 'Min L3 current',
              type: 'line',
              showSymbol: false,
              areaStyle: {},
              data: this.electricGroupedData.minCurrents
                .filter((data: Current) => data.phase === ElectricPhase.L3)
                .map((data: Current) => [
                  new Date(data.time).getTime(),
                  data.current,
                ]),
            },
            {
              name: 'Mean L3 current',
              type: 'line',
              showSymbol: false,
              areaStyle: {},
              data: this.electricGroupedData.meanCurrents
                .filter((data: Current) => data.phase === ElectricPhase.L3)
                .map((data: Current) => [
                  new Date(data.time).getTime(),
                  data.current,
                ]),
            },
            {
              name: 'Max L3 current',
              type: 'line',
              showSymbol: false,
              areaStyle: {},
              data: this.electricGroupedData.maxCurrents
                .filter((data: Current) => data.phase === ElectricPhase.L3)
                .map((data: Current) => [
                  new Date(data.time).getTime(),
                  data.current,
                ]),
            }
          );
        }
        break;
      }
      case ElectricQuantities.VOLTAGE: {
        if (this.voltagePhases)
          if (this.voltagePhases.includes(ElectricPhase.L1)) {
            series.push(
              {
                name: 'Min L1 voltage',
                type: 'line',
                showSymbol: false,
                areaStyle: {},
                data: this.electricGroupedData.minVoltages
                  .filter((data: Voltage) => data.phase === ElectricPhase.L1)
                  .map((data: Voltage) => [
                    new Date(data.time).getTime(),
                    data.voltage,
                  ]),
              },
              {
                name: 'Mean L1 voltage',
                type: 'line',
                showSymbol: false,
                areaStyle: {},
                data: this.electricGroupedData.meanVoltages
                  .filter((data: Voltage) => data.phase === ElectricPhase.L1)
                  .map((data: Voltage) => [
                    new Date(data.time).getTime(),
                    data.voltage,
                  ]),
              },
              {
                name: 'Max L1 voltage',
                type: 'line',
                showSymbol: false,
                areaStyle: {},
                data: this.electricGroupedData.maxVoltages
                  .filter((data: Voltage) => data.phase === ElectricPhase.L1)
                  .map((data: Voltage) => [
                    new Date(data.time).getTime(),
                    data.voltage,
                  ]),
              }
            );
          }

        if (this.currentPhases.includes(ElectricPhase.L2)) {
          series.push(
            {
              name: 'Min L2 voltage',
              type: 'line',
              showSymbol: false,
              areaStyle: {},
              data: this.electricGroupedData.minVoltages
                .filter((data: Voltage) => data.phase === ElectricPhase.L2)
                .map((data: Voltage) => [
                  new Date(data.time).getTime(),
                  data.voltage,
                ]),
            },
            {
              name: 'Mean L2 voltage',
              type: 'line',
              showSymbol: false,
              areaStyle: {},
              data: this.electricGroupedData.meanVoltages
                .filter((data: Voltage) => data.phase === ElectricPhase.L2)
                .map((data: Voltage) => [
                  new Date(data.time).getTime(),
                  data.voltage,
                ]),
            },
            {
              name: 'Max L2 voltage',
              type: 'line',
              showSymbol: false,
              areaStyle: {},
              data: this.electricGroupedData.maxVoltages
                .filter((data: Voltage) => data.phase === ElectricPhase.L2)
                .map((data: Voltage) => [
                  new Date(data.time).getTime(),
                  data.voltage,
                ]),
            }
          );
        }

        if (this.currentPhases.includes(ElectricPhase.L3)) {
          series.push(
            {
              name: 'Min L3 voltage',
              type: 'line',
              showSymbol: false,
              areaStyle: {},
              data: this.electricGroupedData.minVoltages
                .filter((data: Voltage) => data.phase === ElectricPhase.L3)
                .map((data: Voltage) => [
                  new Date(data.time).getTime(),
                  data.voltage,
                ]),
            },
            {
              name: 'Mean L3 voltage',
              type: 'line',
              showSymbol: false,
              areaStyle: {},
              data: this.electricGroupedData.meanVoltages
                .filter((data: Voltage) => data.phase === ElectricPhase.L3)
                .map((data: Voltage) => [
                  new Date(data.time).getTime(),
                  data.voltage,
                ]),
            },
            {
              name: 'Max L3 voltage',
              type: 'line',
              showSymbol: false,
              areaStyle: {},
              data: this.electricGroupedData.maxVoltages
                .filter((data: Voltage) => data.phase === ElectricPhase.L3)
                .map((data: Voltage) => [
                  new Date(data.time).getTime(),
                  data.voltage,
                ]),
            }
          );
        }
        break;
      }
      case ElectricQuantities.GRID_FREQUENCY: {
        series.push(
          {
            name: 'Min grid frequencies',
            type: 'line',
            showSymbol: false,
            areaStyle: {},
            data: this.electricGroupedData.minGridFrequencies.map(
              (data: GridFrequency) => [
                new Date(data.time).getTime(),
                data.frequency,
              ]
            ),
          },
          {
            name: 'Mean grid frequencies',
            type: 'line',
            showSymbol: false,
            areaStyle: {},
            data: this.electricGroupedData.meanGridFrequencies.map(
              (data: GridFrequency) => [
                new Date(data.time).getTime(),
                data.frequency,
              ]
            ),
          },
          {
            name: 'Max grid frequencies',
            type: 'line',
            showSymbol: false,
            areaStyle: {},
            data: this.electricGroupedData.maxGridFrequencies.map(
              (data: GridFrequency) => [
                new Date(data.time).getTime(),
                data.frequency,
              ]
            ),
          }
        );
        break;
      }
    }

    this.lineChart.setOption({
      xAxis: {
        type: 'time',
        splitLine: {
          show: true,
        },
      },
      yAxis: {
        type: 'value',
        splitLine: {
          show: false,
        },
      },
      series: series,
    });
    this.lineChart.hideLoading();
  }

  private initializeOptions(): void {
    this.lineChartOptions = {
      tooltip: {},
      legend: {
        backgroundColor: '#121212',
        textStyle: {
          color: 'white',
        },
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
      series: [],
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

  unsubscribeFromElectricSubscription(): void {
    if (this.lineChartElectricSubscription) {
      this.lineChartElectricSubscription.unsubscribe();
    }
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
      this.getLiveElectricData(); //TODO dorobit
    }, 10000);
  }
  private getLiveElectricData(): void {
    throw new Error('Method not implemented.');
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
