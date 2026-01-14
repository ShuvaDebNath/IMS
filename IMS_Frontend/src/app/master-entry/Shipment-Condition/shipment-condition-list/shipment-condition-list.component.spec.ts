import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShipmentConditionListComponent } from './shipment-condition-list.component';

describe('ShipmentConditionListComponent', () => {
  let component: ShipmentConditionListComponent;
  let fixture: ComponentFixture<ShipmentConditionListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ShipmentConditionListComponent]
    });
    fixture = TestBed.createComponent(ShipmentConditionListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
