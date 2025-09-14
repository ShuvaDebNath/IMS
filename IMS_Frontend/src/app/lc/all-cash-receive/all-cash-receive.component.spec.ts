import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AllCashReceiveComponent } from './all-cash-receive.component';

describe('AllCashReceiveComponent', () => {
  let component: AllCashReceiveComponent;
  let fixture: ComponentFixture<AllCashReceiveComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AllCashReceiveComponent]
    });
    fixture = TestBed.createComponent(AllCashReceiveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
