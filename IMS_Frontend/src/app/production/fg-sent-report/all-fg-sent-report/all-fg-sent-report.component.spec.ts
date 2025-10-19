import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AllFgSentReportComponent } from './all-fg-sent-report.component';

describe('AllFgSentReportComponent', () => {
  let component: AllFgSentReportComponent;
  let fixture: ComponentFixture<AllFgSentReportComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AllFgSentReportComponent]
    });
    fixture = TestBed.createComponent(AllFgSentReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
