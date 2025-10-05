import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PiReportComponent } from './pi-report.component';

describe('PiReportComponent', () => {
  let component: PiReportComponent;
  let fixture: ComponentFixture<PiReportComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PiReportComponent]
    });
    fixture = TestBed.createComponent(PiReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
