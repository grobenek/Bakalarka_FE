import { ElectricQuantities } from './../../interface/electric-quantities';
import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { TreeNode } from 'primeng/api';
@Component({
  selector: 'app-electric-data-tree-select',
  templateUrl: './electric-data-tree-select.component.html',
  styleUrls: ['./electric-data-tree-select.component.scss'],
})
export class ElectricDataTreeSelectComponent implements OnInit {
  @Input() onlyOneOption!: boolean;
  @Output() selectedNodesChange = new EventEmitter<TreeNode[]>();
  public selectionMode!: string;
  public showClear: boolean = true;
  public nodes!: TreeNode[];
  public selectedNodes!: TreeNode[];

  ngOnInit(): void {
    if (this.onlyOneOption) {
      this.selectionMode = 'single';
      this.nodes = [
        {
          label: 'Current',
          data: ElectricQuantities.CURRENT,
        },
        {
          label: 'Voltage',
          data: ElectricQuantities.VOLTAGE,
        },
        {
          label: 'Grid frequency',
          data: ElectricQuantities.GRID_FREQUENCY,
        },
      ];

      this.selectedNodes = [
        { label: 'Current', data: ElectricQuantities.CURRENT },
      ];
    } else {
      this.selectionMode = 'checkbox';
      this.nodes = [
        {
          label: 'Current',
          data: 'Current',
          selectable: true,
          children: [
            {
              label: 'L1',
              data: 'CurrentL1',
              selectable: true,
            },
            {
              label: 'L2',
              data: 'CurrentL2',
              selectable: true,
            },
            {
              label: 'L3',
              data: 'CurrentL3',
              selectable: true,
            },
          ],
        },
        {
          label: 'Voltage',
          data: 'Voltage',
          selectable: true,
          children: [
            {
              label: 'L1',
              data: 'VoltageL1',
              selectable: true,
            },
            {
              label: 'L2',
              data: 'VoltageL2',
              selectable: true,
            },
            {
              label: 'L3',
              data: 'VoltageL3',
              selectable: true,
            },
          ],
        },
        {
          label: 'Grid frequency',
          data: 'Grid frequency',
          selectable: true,
        },
      ];
    }
  }

  public onNodeSelect(): void {
    this.onSelectedNodesChange();
  }

  public onNodeUnselect(): void {
    this.onSelectedNodesChange();
  }

  public onNodeClear(): void {
    this.onSelectedNodesChange();
  }

  public onSelectedNodesChange(): void {
    this.selectedNodesChange.emit(this.selectedNodes ? this.selectedNodes : []);
  }
}
