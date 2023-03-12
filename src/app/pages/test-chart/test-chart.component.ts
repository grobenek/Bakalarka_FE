import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { TemperatureService } from '../../service/temperature/temperature.service';
import { Temperature } from 'src/app/interface/temperature';
import type { ECharts, EChartsOption, EChartsType } from 'echarts';
import { Subscription, lastValueFrom } from 'rxjs';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-test-chart',
  templateUrl: './test-chart.component.html',
  styleUrls: ['./test-chart.component.scss'],
  providers: [MessageService],
})
export class TestChartComponent implements OnInit, OnDestroy {
  public optionsFullChart!: EChartsOption;
  public optionsDynamic!: EChartsOption;
  public dataFull: any = [];
  public dataDynamic: any = [];
  public dynamicChart!: ECharts;
  private temperatureSubscription!: Subscription;

  constructor(
    private temperatureService: TemperatureService,
    private messageService: MessageService
  ) {}

  ngOnDestroy(): void {
    this.temperatureSubscription.unsubscribe();
  }

  async ngOnInit() {
    await this.fetchTemperatures();
    this.initializeOptions();

    setTimeout(() => {
      this.temperatureService.getAllTemperatures().subscribe({
        next: (temperatures: Temperature[]) => {
          const updatedData = temperatures.map((temperature) => {
            const timestamp = new Date(temperature.time).getTime();
            return [timestamp, temperature.temperature];
          });

          this.dataDynamic.push(...updatedData);

          this.dynamicChart.setOption({
            series: [
              {
                data: this.dataDynamic,
              },
            ],
          });
        },
      });
      console.log('new data fetched!');
    }, 10000);
  }

  private initializeOptions(): void {
    this.optionsFullChart = {
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
          data: this.dataFull,
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

    this.optionsDynamic = {
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
          data: this.dataDynamic,
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

  private async fetchTemperatures(): Promise<void> {
    const temperatures: Temperature[] = await lastValueFrom(
      this.temperatureService.getAllTemperatures()
    );
    this.dataFull = temperatures.map((temperature) => {
      const timestamp = new Date(temperature.time).getTime();
      return [timestamp, temperature.temperature];
    });
  }

  onChartInit(chart: any) {
    this.dynamicChart = chart;
  }
}
