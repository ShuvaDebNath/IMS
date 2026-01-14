import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShipmentConditionCreateComponent } from './shipment-condition-create.component';

describe('ShipmentConditionCreateComponent', () => {
  let component: ShipmentConditionCreateComponent;
  let fixture: ComponentFixture<ShipmentConditionCreateComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ShipmentConditionCreateComponent]
    });
    fixture = TestBed.createComponent(ShipmentConditionCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
