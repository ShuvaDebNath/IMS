import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UnapprovedCustomerComponent } from './unapproved-customer.component';

describe('UnapprovedCustomerComponent', () => {
  let component: UnapprovedCustomerComponent;
  let fixture: ComponentFixture<UnapprovedCustomerComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [UnapprovedCustomerComponent]
    });
    fixture = TestBed.createComponent(UnapprovedCustomerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
