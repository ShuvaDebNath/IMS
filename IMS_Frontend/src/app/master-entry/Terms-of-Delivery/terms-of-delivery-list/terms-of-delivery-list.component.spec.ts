import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TermsOfDeliveryListComponent } from './terms-of-delivery-list.component';

describe('TermsOfDeliveryListComponent', () => {
  let component: TermsOfDeliveryListComponent;
  let fixture: ComponentFixture<TermsOfDeliveryListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TermsOfDeliveryListComponent]
    });
    fixture = TestBed.createComponent(TermsOfDeliveryListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
