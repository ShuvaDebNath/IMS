import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BeneficiaryCreateComponent } from './beneficiary-create.component';

describe('BeneficiaryCreateComponent', () => {
  let component: BeneficiaryCreateComponent;
  let fixture: ComponentFixture<BeneficiaryCreateComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [BeneficiaryCreateComponent]
    });
    fixture = TestBed.createComponent(BeneficiaryCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
