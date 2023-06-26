import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ElectricDataTreeSelectComponent } from './electric-data-tree-select.component';

describe('ElectricDataTreeSelectComponent', () => {
  let component: ElectricDataTreeSelectComponent;
  let fixture: ComponentFixture<ElectricDataTreeSelectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ElectricDataTreeSelectComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ElectricDataTreeSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
