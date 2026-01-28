import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MonthlyTaskReportComponent } from './monthly-task-report.component';

describe('MonthlyTaskReportComponent', () => {
  let component: MonthlyTaskReportComponent;
  let fixture: ComponentFixture<MonthlyTaskReportComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MonthlyTaskReportComponent]
    });
    fixture = TestBed.createComponent(MonthlyTaskReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
