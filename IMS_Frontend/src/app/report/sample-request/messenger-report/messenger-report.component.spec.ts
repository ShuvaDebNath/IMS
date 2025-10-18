import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MessengerReportComponent } from './messenger-report.component';

describe('MessengerReportComponent', () => {
  let component: MessengerReportComponent;
  let fixture: ComponentFixture<MessengerReportComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MessengerReportComponent]
    });
    fixture = TestBed.createComponent(MessengerReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
