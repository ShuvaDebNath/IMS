import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomerVisitReportListComponent } from './customer-visit-report-list.component';

describe('CustomerVisitReportListComponent', () => {
  let component: CustomerVisitReportListComponent;
  let fixture: ComponentFixture<CustomerVisitReportListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CustomerVisitReportListComponent]
    });
    fixture = TestBed.createComponent(CustomerVisitReportListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
