import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BeneficiaryListComponent } from './beneficiary-list.component';

describe('BeneficiaryListComponent', () => {
  let component: BeneficiaryListComponent;
  let fixture: ComponentFixture<BeneficiaryListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [BeneficiaryListComponent]
    });
    fixture = TestBed.createComponent(BeneficiaryListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
