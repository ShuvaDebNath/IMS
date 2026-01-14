import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TermsOfDeliveryCreateComponent } from './terms-of-delivery-create.component';

describe('TermsOfDeliveryCreateComponent', () => {
  let component: TermsOfDeliveryCreateComponent;
  let fixture: ComponentFixture<TermsOfDeliveryCreateComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TermsOfDeliveryCreateComponent]
    });
    fixture = TestBed.createComponent(TermsOfDeliveryCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
