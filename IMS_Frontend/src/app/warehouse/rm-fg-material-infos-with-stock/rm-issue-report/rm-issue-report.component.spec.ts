import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RmIssueReportComponent } from './rm-issue-report.component';

describe('RmIssueReportComponent', () => {
  let component: RmIssueReportComponent;
  let fixture: ComponentFixture<RmIssueReportComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [RmIssueReportComponent]
    });
    fixture = TestBed.createComponent(RmIssueReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
