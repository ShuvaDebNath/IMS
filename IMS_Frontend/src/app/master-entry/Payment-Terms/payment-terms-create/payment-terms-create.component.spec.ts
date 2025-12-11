import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentTermsCreateComponent } from './payment-terms-create.component';

describe('PaymentTermsCreateComponent', () => {
  let component: PaymentTermsCreateComponent;
  let fixture: ComponentFixture<PaymentTermsCreateComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PaymentTermsCreateComponent]
    });
    fixture = TestBed.createComponent(PaymentTermsCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
