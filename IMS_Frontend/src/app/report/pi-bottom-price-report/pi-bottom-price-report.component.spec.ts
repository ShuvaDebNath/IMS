import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PiBottomPriceReportComponent } from './pi-bottom-price-report.component';

describe('PiBottomPriceReportComponent', () => {
  let component: PiBottomPriceReportComponent;
  let fixture: ComponentFixture<PiBottomPriceReportComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PiBottomPriceReportComponent]
    });
    fixture = TestBed.createComponent(PiBottomPriceReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
