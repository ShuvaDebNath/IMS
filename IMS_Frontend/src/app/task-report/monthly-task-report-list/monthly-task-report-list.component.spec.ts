import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MonthlyTaskReportListComponent } from './monthly-task-report-list.component';

describe('MonthlyTaskReportListComponent', () => {
  let component: MonthlyTaskReportListComponent;
  let fixture: ComponentFixture<MonthlyTaskReportListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MonthlyTaskReportListComponent]
    });
    fixture = TestBed.createComponent(MonthlyTaskReportListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
