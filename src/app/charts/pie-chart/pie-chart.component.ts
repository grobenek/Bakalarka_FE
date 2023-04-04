import { ElectricData } from './../../interface/electric-data';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ECharts, EChartsOption } from 'echarts';
import { MessageService, SelectItem, TreeNode } from 'primeng/api';
import { Subscription } from 'rxjs';
import { PieChartElectricData } from 'src/app/interface/pie-chart-electric-data';
import { ElectricService } from 'src/app/service/electric/electric.service';
import { ElectricQuantities } from '../../interface/electric-quantities';
import { ElectricPhase } from 'src/app/interface/electric-phase';
import { ElectricDataMinMaxMean } from '../../interface/electric-data';

@Component({
  selector: 'app-pie-chart',
  templateUrl: './pie-chart.component.html',
  styleUrls: ['./pie-chart.component.scss'],
})
export class PieChartComponent implements OnInit, OnDestroy {
  public pieChartOptions!: EChartsOption;
  public rangeDates: Date[] = [new Date()]; // initializing calendar's choice
  public pieChartSelectedDataOptions: TreeNode[] = [];
  public pieChartSelectedDateOption: string = 'live';
  public readonly pieChartListDateOptions: SelectItem[] = [
    { label: 'Live Data', value: 'live' },
    { label: 'Last 24 hours', value: 'day' },
    { label: 'Past 7 Days', value: '7days' },
    { label: 'Past 30 Days', value: '30days' },
    { label: 'Past Year', value: 'year' },
  ];
  public pieChartData!: PieChartElectricData;
  private pieChartElectricSubscription!: Subscription;
  private intervalId: any;
  private pieChart!: ECharts;
  private electricQuantities!: ElectricQuantities[];
  private static readonly MILLISECONDS_IN_HOUR = 60 * 60 * 1000;
  private static readonly MILLISECONDS_IN_DAY =
    24 * PieChartComponent.MILLISECONDS_IN_HOUR;
  private readonly MAXIMUM_NUMBER_OF_POINTS_IN_CHART = 400;

  constructor(
    private electricService: ElectricService,
    private messageService: MessageService
  ) {}

  async ngOnInit(): Promise<void> {
    this.electricQuantities = [];
    this.pieChartData = { currents: [], voltages: [] };
    this.initializeOptions();
    await this.waitUntilChartInitialized();
    this.pieChartSelectedDataOptions = [];
  }

  public ngOnDestroy(): void {
    this.unsubscribeFromElectricSubscription();
    this.stopLiveElectricInterval();
  }

  private initializeOptions(): void {
    this.pieChartOptions = {
      tooltip: {
        trigger: 'item',
      },
      legend: {
        top: '5%',
        left: 'center',
        backgroundColor: '#121212',
        textStyle: {
          color: 'white',
        },
      },
      series: [],
    };
  }

  public async onSelectedNodesChange(selectedData: TreeNode[]): Promise<void> {
    if (!this.pieChart) {
      await this.waitUntilChartInitialized();
    }

    this.resetChartLegend();
    console.log('resetted');
    console.log(selectedData as TreeNode);

    if (!selectedData) {
      return;
    }

    let data = selectedData as TreeNode;

    if (Array.isArray(selectedData)) {
      if (selectedData.length === 0) {
        return;
      } else {
        data = selectedData[0];
      }
    }

    this.electricQuantities = [];

    if (data?.data === 'Current') {
      this.electricQuantities.push(ElectricQuantities.CURRENT);
    }

    if (data?.data === 'Voltage') {
      this.electricQuantities.push(ElectricQuantities.VOLTAGE);
    }

    this.onDateOptionChange();
  }

  private resetChartLegend(): void {
    this?.pieChart.setOption(
      {
        tooltip: {
          trigger: 'item',
        },
        legend: {
          top: '5%',
          left: 'center',
          backgroundColor: '#121212',
          textStyle: {
            color: 'white',
          },
        },
        series: [],
      },
      true
    );
  }

  public onDateRangeSelect(): void {
    this.pieChartSelectedDateOption = '';
    this.stopLiveElectricInterval();
    this.unsubscribeFromElectricSubscription();
    this.pieChart?.showLoading;
    this.clearPieChartData();

    if (this.rangeDates[1] === null) {
      this.pieChartElectricSubscription = this.electricService
        .getAllElectricQuantitiesFromDate(
          this.rangeDates[0],
          this.electricQuantities,
          [],
          []
        )
        .subscribe((data: ElectricDataMinMaxMean) => {
          if (data.meanCurrents) {
            this.pieChartData.currents = data.meanCurrents;
          }

          if (data.meanVoltages) {
            this.pieChartData.voltages = data.meanVoltages;
          }
          this.updatePieChart();

          if (this.isElectricDataEmpty(data)) {
            this.messageService.add({
              severity: 'warn',
              summary: 'No data found',
              detail: `No data found for date \n ${this.rangeDates[0].toLocaleDateString()}.`,
            });
          }
        });
    } else {
      this.pieChartElectricSubscription = this.electricService
        .getGroupedElectricQuantitiesBetweenDate(
          this.rangeDates[0],
          this.rangeDates[1],
          this.electricQuantities,
          [],
          []
        )
        .subscribe((data: ElectricDataMinMaxMean) => {
          if (data.meanCurrents) {
            this.pieChartData.currents = data.meanCurrents;
          }

          if (data.meanVoltages) {
            this.pieChartData.voltages = data.meanVoltages;
          }

          this.updatePieChart();

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

  isElectricDataEmpty(data: ElectricDataMinMaxMean): boolean {
    return (
      this.pieChartData.currents.length === 0 &&
      this.pieChartData.voltages.length === 0
    );
  }

  public onDateOptionChange(): void {
    this.unsubscribeFromElectricSubscription();
    this.clearPieChartData();
    this.pieChart?.showLoading();
    this.rangeDates = [new Date()];
    this.stopLiveElectricInterval();

    switch (this.pieChartSelectedDateOption) {
      case 'live':
        this.getLiveElectricData();
        this.startLiveElectricInterval();
        break;
      case 'day':
        this.loadDataForPeriod(PieChartComponent.MILLISECONDS_IN_DAY);
        break;
      case '7days':
        this.loadDataForPeriod(7 * PieChartComponent.MILLISECONDS_IN_DAY);
        break;
      case '30days':
        this.loadDataForPeriod(30 * PieChartComponent.MILLISECONDS_IN_DAY);
        break;
      case 'year':
        this.loadDataForPeriod(365 * PieChartComponent.MILLISECONDS_IN_DAY);
        break;
      default:
        this.startLiveElectricInterval();
        break;
    }
  }

  private loadDataForPeriod(period: number): void {
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - period);

    this.unsubscribeFromElectricSubscription();

    this.fetchAndUpdateDataBetweenDates(startDate, endDate);
  }

  private fetchAndUpdateDataBetweenDates(startDate: Date, endDate: Date) {
    this.unsubscribeFromElectricSubscription();
    this.clearPieChartData();

    this.pieChartElectricSubscription = this.electricService
      .getGroupedElectricQuantitiesBetweenDate(
        startDate,
        endDate,
        this.electricQuantities,
        [],
        []
      )
      .subscribe((data: ElectricDataMinMaxMean) => {
        console.log('Data: ' + JSON.stringify(data, null, 2));

        if (data.meanCurrents) {
          this.pieChartData.currents = data.meanCurrents;
        }

        if (data.meanVoltages) {
          this.pieChartData.voltages = data.meanVoltages;
        }

        this.updatePieChart();
      });
  }

  private updatePieChart(): void {
    let series = [];

    console.log(this.pieChartData);

    if (!(this.pieChartData.currents.length === 0)) {
      series.push(
        {
          name: 'Current',
          type: 'pie',
          radius: ['40%', '70%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 10,
            borderColor: '#fff',
            borderWidth: 2,
          },
          label: {
            show: false,
            position: 'center',
          },
          emphasis: {
            label: {
              show: true,
              fontSize: 40,
              fontWeight: 'bold',
            },
          },
          labelLine: {
            show: false,
          },
          data: [
            {
              value: this.sumData(ElectricQuantities.CURRENT, ElectricPhase.L1),
              name: 'L1',
            },
            {
              value: this.sumData(ElectricQuantities.CURRENT, ElectricPhase.L2),
              name: 'L2',
            },
            {
              value: this.sumData(ElectricQuantities.CURRENT, ElectricPhase.L3),
              name: 'L3',
            },
          ],
        },
        false
      );
    }

    if (!(this.pieChartData.voltages.length === 0)) {
      series.push({
        name: 'Voltage',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2,
        },
        label: {
          show: false,
          position: 'center',
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 40,
            fontWeight: 'bold',
          },
        },
        labelLine: {
          show: false,
        },
        data: [
          {
            value: this.sumData(ElectricQuantities.VOLTAGE, ElectricPhase.L1),
            name: 'L1',
          },
          {
            value: this.sumData(ElectricQuantities.VOLTAGE, ElectricPhase.L2),
            name: 'L2',
          },
          {
            value: this.sumData(ElectricQuantities.VOLTAGE, ElectricPhase.L3),
            name: 'L3',
          },
        ],
      });
    }

    this.pieChart?.hideLoading();

    console.log(series);

    this.pieChart.setOption({
      series: series,
    });
  }

  sumData(quantity: ElectricQuantities, phase: ElectricPhase): number {
    let sum: number = 0;

    if (quantity === ElectricQuantities.CURRENT) {
      sum += this.pieChartData.currents.reduce((acc, current) => {
        if (current.phase === phase) {
          return acc + current.current;
        } else {
          return acc;
        }
      }, 0);
    }

    if (quantity === ElectricQuantities.VOLTAGE) {
      sum += this.pieChartData.voltages.reduce((acc, voltage) => {
        if (voltage.phase === phase) {
          return acc + voltage.voltage;
        } else {
          return acc;
        }
      }, 0);
    }

    return sum;
  }

  private clearPieChartData(): void {
    this.pieChartData = { currents: [], voltages: [] };
  }

  private unsubscribeFromElectricSubscription(): void {
    if (this.pieChartElectricSubscription) {
      this.pieChartElectricSubscription.unsubscribe();
    }
  }

  public onPieChartInit(chart: any): void {
    this.pieChart = chart;
  }

  private async waitUntilChartInitialized(): Promise<void> {
    return new Promise<void>((resolve) => {
      if (this.pieChart) {
        resolve();
      } else {
        this.onPieChartInit = (chart: any) => {
          this.pieChart = chart;

          resolve();
        };
      }
    });
  }

  private stopLiveElectricInterval(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
    }
  }

  private startLiveElectricInterval(): void {
    this.pieChart?.hideLoading();
    this.intervalId = setInterval(() => {
      this.getLiveElectricData();
    }, 5000);
  }

  private getLiveElectricData(): void {
    this.unsubscribeFromElectricSubscription();

    this.pieChartElectricSubscription = this.electricService
      .getLastNValues(
        this.MAXIMUM_NUMBER_OF_POINTS_IN_CHART,
        this.electricQuantities,
        [],
        []
      )
      .subscribe((data: ElectricData) => {
        if (data.currents.length > 0) {
          this.pieChartData.currents = data.currents;
        }

        if (data.voltages.length > 0) {
          this.pieChartData.voltages = data.voltages;
        }
        this.updatePieChart();
      });
  }
}
