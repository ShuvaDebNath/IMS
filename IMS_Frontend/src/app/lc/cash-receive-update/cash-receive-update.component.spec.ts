import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CashReceiveUpdateComponent } from './cash-receive-update.component';

describe('CashReceiveUpdateComponent', () => {
  let component: CashReceiveUpdateComponent;
  let fixture: ComponentFixture<CashReceiveUpdateComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CashReceiveUpdateComponent]
    });
    fixture = TestBed.createComponent(CashReceiveUpdateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
