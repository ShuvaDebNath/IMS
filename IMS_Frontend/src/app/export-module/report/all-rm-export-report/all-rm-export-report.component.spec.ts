import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AllRmExportReportComponent } from './all-rm-export-report.component';

describe('AllRmExportReportComponent', () => {
  let component: AllRmExportReportComponent;
  let fixture: ComponentFixture<AllRmExportReportComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AllRmExportReportComponent]
    });
    fixture = TestBed.createComponent(AllRmExportReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
