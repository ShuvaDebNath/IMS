import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentTermsListComponent } from './payment-terms-list.component';

describe('PaymentTermsListComponent', () => {
  let component: PaymentTermsListComponent;
  let fixture: ComponentFixture<PaymentTermsListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PaymentTermsListComponent]
    });
    fixture = TestBed.createComponent(PaymentTermsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
