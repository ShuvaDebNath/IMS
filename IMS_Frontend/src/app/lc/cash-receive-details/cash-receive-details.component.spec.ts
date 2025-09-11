import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CashReceiveDetailsComponent } from './cash-receive-details.component';

describe('CashReceiveDetailsComponent', () => {
  let component: CashReceiveDetailsComponent;
  let fixture: ComponentFixture<CashReceiveDetailsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CashReceiveDetailsComponent]
    });
    fixture = TestBed.createComponent(CashReceiveDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
