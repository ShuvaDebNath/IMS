import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeliveryLogReportComponent } from './delivery-log-report.component';

describe('DeliveryLogReportComponent', () => {
  let component: DeliveryLogReportComponent;
  let fixture: ComponentFixture<DeliveryLogReportComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DeliveryLogReportComponent]
    });
    fixture = TestBed.createComponent(DeliveryLogReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
