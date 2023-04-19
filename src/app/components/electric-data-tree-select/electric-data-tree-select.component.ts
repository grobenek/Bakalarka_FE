import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { TreeNode } from 'primeng/api';
import { Tree } from 'primeng/tree';
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

    if (!this.onlyOneOption) {
      if (this.nodes[0].children != undefined) {
        this.selectedNodes = [this.nodes[0].children[0]];
        this.onSelectedNodesChange();
      } else {
        this.selectedNodes = [this.nodes[0]];
        this.onSelectedNodesChange();
      }
    }

    if (this.onlyParents) {
      this.selectedNodes = [this.nodes[0]];
      this.onSelectedNodesChange();
    }
  }

  public onNodeSelect(event: any): void {
    const selectedNode = this.selectedNodes ? this.selectedNodes[0] : undefined;
    const eventChildren = event.node.children;
    const eventLabel = event.node.label;
    const eventParent = event.node.parent;

    if (this.onlyOneOption) {
      return;
    }

    if (!selectedNode) {
      this.onSelectedNodesChange();
      return;
    }

    if (eventChildren && selectedNode.label !== eventLabel) {
      this.selectedNodes = this.selectedNodes.filter(function (node: TreeNode) {
        return !eventChildren.includes(node);
      });
      this.selectedNodes.pop();
      return;
    }

    if (!eventParent && selectedNode.label !== eventLabel) {
      this.selectedNodes.pop();
      return;
    }

    if (selectedNode.parent && selectedNode.parent.label !== eventParent.label) {
      if (eventParent) {
        eventParent.partialSelected = false;
      }
      this.selectedNodes.pop();
      return;
    }

    this.onSelectedNodesChange();
  }

  public onNodeUnselect(event: any): void {
    this.onSelectedNodesChange();
  }

  public onNodeClear(): void {
    this.selectedNodes = [];
    this.onSelectedNodesChange();
  }

  public onSelectedNodesChange(): void {
    this.selectedNodesChange.emit(this.selectedNodes ? this.selectedNodes : []);
  }
}
