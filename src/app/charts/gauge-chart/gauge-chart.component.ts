import { Component, OnInit, OnDestroy } from '@angular/core';
import { ECharts, EChartsOption } from 'echarts';
import { Subscription } from 'rxjs';
import { ElectricService } from 'src/app/service/electric/electric.service';
import { GaugeElectricData } from '../../interface/gauge-electric-data';
import { ElectricQuantities } from 'src/app/interface/electric-quantities';

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
  private selectedData: ElectricQuantities = ElectricQuantities.CURRENT;

  constructor(private electriService: ElectricService) {}

  public async ngOnInit(): Promise<void> {
    this.initializeChartOptions();
    await this.waitUntilGaugeChartInitialized();
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
                [0.3, '#32CD32'],
                [0.7, '#FFA500'],
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
            fontSize: 16,
          },
          detail: {
            valueAnimation: true,
            formatter: this.getFormatter(this.selectedData),
            color: 'inherit',
            fontSize: 16,
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

  onSelectedNodesChange(selectedData: ElectricQuantities): void {
    this.selectedData = selectedData;
    this.updateGaugeChartFormatter();
    this.stopLiveElectricDataInterval();
    this.unsubscribeFromElectricService();
    this.startLiveElectricDataInterval();
  }

  private getLiveElectricData(selectedData: ElectricQuantities): void {
    if (!selectedData) {
      this.gaugeData = 0;
      this.updateGaugeChartData();
      return;
    }

    let electricQuantity: ElectricQuantities;

    switch (selectedData) {
      case ElectricQuantities.CURRENT:
        electricQuantity = ElectricQuantities.CURRENT;
        break;
      case ElectricQuantities.VOLTAGE:
        electricQuantity = ElectricQuantities.VOLTAGE;
        break;
      case ElectricQuantities.GRID_FREQUENCY:
        electricQuantity = ElectricQuantities.GRID_FREQUENCY;
        break;
      default:
        return;
    }

    this.gaugeChartElectricSubscription = this.electriService
      .getLastElectricQuantity([electricQuantity])
      .subscribe((data: GaugeElectricData) => {
        this.gaugeData = Number(data.value.toPrecision(4));
        this.updateGaugeChartData();
      });
  }

  private updateGaugeChartData(): void {
    if (!this.gaugeChart) {
      return;
    }

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

  private updateGaugeChartFormatter(): void {
    if (!this.gaugeChart) {
      return;
    }

    this.gaugeChart.setOption({
      series: [
        {
          name: 'GaugeElectricData',
          detail: {
            formatter: this.getFormatter(this.selectedData),
          },
        },
      ],
    });
  }

  private getFormatter(selectedData: ElectricQuantities): string {
    switch (selectedData) {
      case ElectricQuantities.CURRENT:
        return '{value}\nA';
      case ElectricQuantities.VOLTAGE:
        return '{value}\nV';
      case ElectricQuantities.GRID_FREQUENCY:
        return '{value}\nHz';
      default:
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
    this.getLiveElectricData(this.selectedData);
    this.intervalId = setInterval(() => {
      if (this.selectedData) {
        this.getLiveElectricData(this.selectedData);
      }
    }, 10000);
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
