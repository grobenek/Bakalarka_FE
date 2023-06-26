import { Component, OnInit, OnDestroy } from '@angular/core';
import { ECharts, EChartsOption } from 'echarts';
import { Subscription } from 'rxjs';
import { ElectricService } from 'src/app/service/electric/electric.service';
import { GaugeElectricData } from '../../interface/gauge-electric-data';
import { ElectricQuantities } from 'src/app/interface/electric-quantities';
import { TreeNode } from 'primeng/api';
import { ElectricPhase } from 'src/app/interface/electric-phase';

@Component({
  selector: 'app-gauge-chart',
  templateUrl: './gauge-chart.component.html',
  styleUrls: ['./gauge-chart.component.scss'],
})
export class GaugeChartComponent implements OnInit, OnDestroy {
  public optionsGaugeChart!: EChartsOption;
  public gaugeData: number = 0;
  private gaugeChartElectricSubscription!: Subscription;
  private gaugeChart!: ECharts;
  private intervalId: any;
  private selectedData: TreeNode<any> | null = null;
  private currentPhases: ElectricPhase[] = [];
  private voltagePhases: ElectricPhase[] = [];
  private electricQuantities: ElectricQuantities[] = [];

  constructor(private electriService: ElectricService) {}

  public async ngOnInit(): Promise<void> {
    this.initializeChartOptions();
    await this.waitUntilGaugeChartInitialized();
    this.onSelectedNodesChange([{ data: 'CurrentL1' }]);
    this.startLiveElectricDataInterval();
  }

  public ngOnDestroy(): void {
    this.unsubscribeFromElectricService();
    this.stopLiveElectricDataInterval();
  }

  private initializeChartOptions(): void {
    this.optionsGaugeChart = {
      series: [
        {
          name: 'GaugeElectricData',
          min: 0,
          max: 100,
          type: 'gauge',
          axisLine: {
            lineStyle: {
              width: 30,
              color: [
                [0.3, '#91CC75'],
                [0.7, '#FFDC60'],
                [1, '#FF0000'],
              ],
            },
          },
          pointer: {
            itemStyle: {
              color: 'inherit',
            },
            length: '60%',
          },
          axisTick: {
            distance: -30,
            length: 8,
            lineStyle: {
              color: '#fff',
              width: 2,
            },
          },
          splitLine: {
            distance: -30,
            length: 30,
            lineStyle: {
              color: '#fff',
              width: 4,
            },
          },
          axisLabel: {
            color: 'inherit',
            distance: 35,
            fontSize: 15,
          },
          detail: {
            valueAnimation: true,
            formatter: this.getFormatter(this.selectedData || null),
            color: 'inherit',
            fontSize: 15,
          },
          data: [
            {
              value: this.gaugeData,
            },
          ],
        },
      ],
    };
  }

  public onGaugeChartInit(chart: any): void {
    this.gaugeChart = chart;
  }

  async onSelectedNodesChange(selectedData: TreeNode[]): Promise<void> {
    this.electricQuantities = [];
    this.currentPhases = [];
    this.voltagePhases = [];

    if (!selectedData) {
      return;
    }

    if (Array.isArray(selectedData)) {
      if (selectedData.length > 0) {
        this.selectedData = selectedData[0];
      } else {
        this.electricQuantities = [ElectricQuantities.CURRENT];
        this.currentPhases = [ElectricPhase.L1];
        this.selectedData = { data: 'CurrentL1' };

        this.updateGaugeChartFormatter();
        this.stopLiveElectricDataInterval();
        this.unsubscribeFromElectricService();
        this.startLiveElectricDataInterval();
      }
    } else {
      this.selectedData = selectedData;
    }

    switch (this.selectedData.data) {
      case 'CurrentL1':
      case 'CurrentL2':
      case 'CurrentL3': {
        const phase = this.selectedData.data.replace(
          'Current',
          ''
        ) as ElectricPhase;
        if (!this.currentPhases.includes(phase)) {
          this.currentPhases.push(phase);
        }
        if (!this.electricQuantities.includes(ElectricQuantities.CURRENT)) {
          this.electricQuantities.push(ElectricQuantities.CURRENT);
        }
        break;
      }

      case 'VoltageL1':
      case 'VoltageL2':
      case 'VoltageL3': {
        const phase = this.selectedData.data.replace(
          'Voltage',
          ''
        ) as ElectricPhase;
        if (!this.voltagePhases.includes(phase)) {
          this.voltagePhases.push(phase);
        }
        if (!this.electricQuantities.includes(ElectricQuantities.VOLTAGE)) {
          this.electricQuantities.push(ElectricQuantities.VOLTAGE);
        }
        break;
      }

      case 'Grid frequency': {
        if (
          !this.electricQuantities.includes(ElectricQuantities.GRID_FREQUENCY)
        ) {
          this.electricQuantities.push(ElectricQuantities.GRID_FREQUENCY);
        }
        break;
      }

      default:
        break;
    }
    this.stopLiveElectricDataInterval();
    this.unsubscribeFromElectricService();
    this.startLiveElectricDataInterval();
  }

  private getLiveElectricData(): void {
    if (!this.electricQuantities || this.electricQuantities.length === 0) {
      return;
    }

    const electricQuantity = this.electricQuantities[0];

    this.gaugeChartElectricSubscription = this.electriService
      .getLastElectricQuantity(
        electricQuantity,
        this.currentPhases,
        this.voltagePhases
      )
      .subscribe((data: GaugeElectricData) => {
        this.gaugeData = Number(data.value.toPrecision(4));
        this.updateGaugeChartData();
      });
  }

  private async updateGaugeChartData(): Promise<void> {
    if (!this.gaugeChart) {
      await this.waitUntilGaugeChartInitialized();
    }

    this.updateGaugeChartFormatter();

    this.gaugeChart.setOption({
      series: [
        {
          name: 'GaugeElectricData',
          data: [
            {
              value: this.gaugeData,
            },
          ],
        },
      ],
    });
  }

  private async updateGaugeChartFormatter(): Promise<void> {
    if (!this.gaugeChart) {
      await this.waitUntilGaugeChartInitialized();
    }

    let minValue = 0;
    let maxValue = 0;

    switch (this.electricQuantities.at(0)) {
      case ElectricQuantities.CURRENT:
        minValue = -40;
        maxValue = 40;
        break;
      case ElectricQuantities.VOLTAGE:
        minValue = 209;
        maxValue = 253;
        break;
      case ElectricQuantities.GRID_FREQUENCY:
        minValue = 49.8;
        maxValue = 50.2;
        break;
      default:
        minValue = 0;
        maxValue = 0;
        break;
    }

    this.gaugeChart.setOption({
      series: [
        {
          name: 'GaugeElectricData',
          min: minValue,
          max: maxValue,
          detail: {
            formatter: this.getFormatter(this.selectedData || null),
          },
        },
      ],
    });
  }

  private getFormatter(selectedData: TreeNode | null): string {
    if (!selectedData) {
      return '';
    }

    if (selectedData.data.includes('Current')) {
      return '{value}\nA';
    } else if (selectedData.data.includes('Voltage')) {
      return '{value}\nV';
    } else if (selectedData.data === 'Grid frequency') {
      return '{value}\nHz';
    } else {
      return '';
    }
  }

  private stopLiveElectricDataInterval(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
    }
  }

  private startLiveElectricDataInterval(): void {
    this.stopLiveElectricDataInterval();
    this.getLiveElectricData();
    this.intervalId = setInterval(() => {
      if (this.selectedData) {
        this.getLiveElectricData();
      }
    }, 5000);
  }

  private async waitUntilGaugeChartInitialized(): Promise<void> {
    return new Promise<void>((resolve) => {
      if (this.gaugeChart) {
        resolve();
      } else {
        this.onGaugeChartInit = (chart: any) => {
          this.gaugeChart = chart;
          resolve();
        };
      }
    });
  }

  private unsubscribeFromElectricService(): void {
    if (this.gaugeChartElectricSubscription) {
      this.gaugeChartElectricSubscription.unsubscribe();
    }
  }
}
