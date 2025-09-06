import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AllCommercialInvoiceComponent } from './all-commercial-invoice.component';

describe('AllCommercialInvoiceComponent', () => {
  let component: AllCommercialInvoiceComponent;
  let fixture: ComponentFixture<AllCommercialInvoiceComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AllCommercialInvoiceComponent]
    });
    fixture = TestBed.createComponent(AllCommercialInvoiceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
