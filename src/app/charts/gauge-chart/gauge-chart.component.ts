import { Component, OnInit, OnDestroy } from '@angular/core';
import { ECharts, EChartsOption } from 'echarts';
import { Subscription } from 'rxjs';
import { TemperatureService } from 'src/app/service/temperature/temperature.service';
import { Temperature } from '../../interface/temperature';

@Component({
  selector: 'app-gauge-chart',
  templateUrl: './gauge-chart.component.html',
  styleUrls: ['./gauge-chart.component.scss'],
})
export class GaugeChartComponent implements OnInit, OnDestroy {
  public optionsGaugeChart!: EChartsOption;
  public gaugeData: number = 0;
  private gaugeChartTemperatureSubscription!: Subscription;
  private gaugeChart!: ECharts;
  private intervalId: any;

  constructor(private temperatureService: TemperatureService) {}

  public async ngOnInit(): Promise<void> {
    this.initializeChartOptions();
    await this.waitUntilGaugeChartInitialized();
    this.getLiveTemperature();
    this.startLiveTemperatureInterval();
  }

  public ngOnDestroy(): void {
    this.unsubscribeFromTemperatureService();
    this.stopLiveTemperatureInterval();
  }

  private initializeChartOptions(): void {
    this.optionsGaugeChart = {
      series: [
        {
          name: 'GaugeTemperature',
          min: 0,
          max: 20,
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
            distance: 40,
            fontSize: 20,
          },
          detail: {
            valueAnimation: true,
            formatter: '{value} °C',
            color: 'inherit',
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

  private getLiveTemperature(): void {
    this.gaugeChartTemperatureSubscription = this.temperatureService
      .getLastTemperature()
      .subscribe((temperature: Temperature) => {
        this.gaugeData = Number(temperature.temperature.toFixed(2));
        this.unsubscribeFromTemperatureService();
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
          name: 'GaugeTemperature',
          data: [
            {
              value: this.gaugeData,
            },
          ],
        },
      ],
    });
  }

  private stopLiveTemperatureInterval(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
    }
  }

  private startLiveTemperatureInterval(): void {
    this.intervalId = setInterval(() => {
      this.getLiveTemperature();
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

  private unsubscribeFromTemperatureService(): void {
    if (this.gaugeChartTemperatureSubscription) {
      this.gaugeChartTemperatureSubscription.unsubscribe();
    }
  }
}
