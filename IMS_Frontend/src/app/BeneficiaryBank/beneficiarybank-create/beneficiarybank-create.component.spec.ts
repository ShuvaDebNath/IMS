import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BeneficiarybankCreateComponent } from './beneficiarybank-create.component';

describe('BeneficiarybankCreateComponent', () => {
  let component: BeneficiarybankCreateComponent;
  let fixture: ComponentFixture<BeneficiarybankCreateComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [BeneficiarybankCreateComponent]
    });
    fixture = TestBed.createComponent(BeneficiarybankCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
