import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BeneficiaryBankListComponent } from './beneficiary-bank-list.component';

describe('BeneficiaryBankListComponent', () => {
  let component: BeneficiaryBankListComponent;
  let fixture: ComponentFixture<BeneficiaryBankListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [BeneficiaryBankListComponent]
    });
    fixture = TestBed.createComponent(BeneficiaryBankListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
