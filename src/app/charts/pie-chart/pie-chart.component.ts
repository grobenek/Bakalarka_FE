import { Component } from '@angular/core';
import { EChartsOption } from 'echarts';
import { SelectItem, TreeNode } from 'primeng/api';

@Component({
  selector: 'app-pie-chart',
  templateUrl: './pie-chart.component.html',
  styleUrls: ['./pie-chart.component.scss'],
})
export class PieChartComponent {
  public rangeDates: Date[] = [new Date()]; // initializing calendar's choice
  public lineChartSelectedDataOptions: TreeNode[] = [];
  public lineChartSelectedDateOption: string = 'live';
  public readonly lineChartListDateOptions: SelectItem[] = [
    { label: 'Live Data', value: 'live' },
    { label: 'Last 24 hours', value: 'day' },
    { label: 'Past 7 Days', value: '7days' },
    { label: 'Past 30 Days', value: '30days' },
    { label: 'Past Year', value: 'year' },
  ]

  public option: EChartsOption = {
    tooltip: {
      trigger: 'item',
    },
    legend: {
      top: '5%',
      left: 'center',
      backgroundColor: '#121212',
        textStyle: {
          color: 'white'
        }
    },
    series: [
      {
        name: 'Access From',
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
          { value: 1048, name: 'Search Engine' },
          { value: 735, name: 'Direct' },
          { value: 580, name: 'Email' },
        ],
      },
    ],
  };

  public onSelectedNodesChange(selectedData: TreeNode[]): void {

  }

  public onDateRangeSelect(): void {

  }

  public onDateOptionChange(): void {

  }
}
