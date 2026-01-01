import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomerVisitReportComponent } from './customer-visit-report.component';

describe('CustomerVisitReportComponent', () => {
  let component: CustomerVisitReportComponent;
  let fixture: ComponentFixture<CustomerVisitReportComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CustomerVisitReportComponent]
    });
    fixture = TestBed.createComponent(CustomerVisitReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
