import { ElectricQuantities } from './../../interface/electric-quantities';
import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { TreeNode } from 'primeng/api';
import { last } from 'rxjs';
@Component({
  selector: 'app-electric-data-tree-select',
  templateUrl: './electric-data-tree-select.component.html',
  styleUrls: ['./electric-data-tree-select.component.scss'],
})
export class ElectricDataTreeSelectComponent implements OnInit {
  @Input() onlyOneOption!: boolean;
  @Input() onlyParents!: boolean;
  @Input() onlyDataWithPhases!: boolean;
  @Output() selectedNodesChange = new EventEmitter<TreeNode[]>();
  public selectionMode!: string;
  public showClear: boolean = true;
  public nodes!: TreeNode[];
  public selectedNodes!: TreeNode[];

  constructor() {}

  ngOnInit(): void {
    if (!this.onlyOneOption) {
      this.selectedNodes = [
        {
          label: 'L1',
          data: 'CurrentL1',
          selectable: true,
        },
      ];
    }

    if (this.onlyParents) {
      this.selectedNodes = [
        {
          label: 'Current',
          data: 'Current',
          selectable: true,
        },
      ];
    }

    this.onSelectedNodesChange();
    if (this.onlyOneOption) {
      this.selectionMode = 'single';

      if (this.onlyDataWithPhases) {
        this.nodes = [
          {
            label: 'Current',
            data: 'Current',
            selectable: true,
          },
          {
            label: 'Voltage',
            data: 'Voltage',
            selectable: true,
          },
        ];
      } else {
        this.nodes = [
          {
            label: 'Current',
            data: 'Current',
            selectable: false,
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
            selectable: false,
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
