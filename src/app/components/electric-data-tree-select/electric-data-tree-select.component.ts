import { ElectricQuantities } from './../../interface/electric-quantities';
import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';

@Component({
  selector: 'app-electric-data-tree-select',
  templateUrl: './electric-data-tree-select.component.html',
  styleUrls: ['./electric-data-tree-select.component.scss'],
})
export class ElectricDataTreeSelectComponent implements OnInit {
  @Input() onlyOneOption!: boolean;
  @Output() selectedNodesChange = new EventEmitter<ElectricQuantities>();
  public selectionMode!: string;
  public showClear: boolean = true;
  public nodes!: any;
  public selectedNodes: any;

  ngOnInit(): void {
    if (this.onlyOneOption) {
      this.selectionMode = 'single';
      this.nodes = [
        {
          key: '0',
          label: 'Current',
          data: ElectricQuantities.CURRENT,
        },
        {
          key: '2',
          label: 'Voltage',
          data: ElectricQuantities.VOLTAGE,
        },
        {
          key: '1',
          label: 'Grid frequency',
          data: ElectricQuantities.GRID_FREQUENCY,
        },
      ];
    } else {
      this.selectionMode = 'checkbox';
      this.nodes = [
        {
          key: '0',
          label: 'Current',
          data: 'Current',
          children: [
            {
              key: '0-0',
              label: 'L1',
              data: 'CurrentL1',
            },
            {
              key: '0-1',
              label: 'L2',
              data: 'CurrentL2',
            },
            {
              key: '0-2',
              label: 'L3',
              data: 'CurrentL3',
            },
          ],
        },
        {
          key: '2',
          label: 'Voltage',
          data: 'Voltage',
          children: [
            {
              key: '2-0',
              label: 'L1',
              data: 'VoltageL1',
            },
            {
              key: '2-1',
              label: 'L2',
              data: 'VoltageL2',
            },
            {
              key: '2-2',
              label: 'L3',
              data: 'VoltageL3',
            },
          ],
        },
        ,
        {
          key: '1',
          label: 'Grid frequency',
          data: 'Grid frequency',
        },
      ];
    }
  }

  onNodeSelect(): void {
    this.onSelectedNodesChange();
  }

  onNodeUnselect(): void {
    this.onSelectedNodesChange();
  }

  onNodeClear(): void {
    this.onSelectedNodesChange();
  }

  onSelectedNodesChange(): void {
    this.selectedNodesChange.emit(
      this.selectedNodes ? this.selectedNodes.data : ''
    );
  }
}
