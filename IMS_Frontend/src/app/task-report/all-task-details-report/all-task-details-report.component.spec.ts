import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AllTaskDetailsReportComponent } from './all-task-details-report.component';

describe('AllTaskDetailsReportComponent', () => {
  let component: AllTaskDetailsReportComponent;
  let fixture: ComponentFixture<AllTaskDetailsReportComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AllTaskDetailsReportComponent]
    });
    fixture = TestBed.createComponent(AllTaskDetailsReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
