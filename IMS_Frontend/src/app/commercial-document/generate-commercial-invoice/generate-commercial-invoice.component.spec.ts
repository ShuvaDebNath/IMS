import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GenerateCommercialInvoiceComponent } from './generate-commercial-invoice.component';

describe('GenerateCommercialInvoiceComponent', () => {
  let component: GenerateCommercialInvoiceComponent;
  let fixture: ComponentFixture<GenerateCommercialInvoiceComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [GenerateCommercialInvoiceComponent]
    });
    fixture = TestBed.createComponent(GenerateCommercialInvoiceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
