import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AllSalesContractComponent } from './all-sales-contract.component';

describe('AllSalesContractComponent', () => {
  let component: AllSalesContractComponent;
  let fixture: ComponentFixture<AllSalesContractComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AllSalesContractComponent]
    });
    fixture = TestBed.createComponent(AllSalesContractComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
