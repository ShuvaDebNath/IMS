import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SalesContractDetailsComponent } from './sales-contract-details.component';

describe('SalesContractDetailsComponent', () => {
  let component: SalesContractDetailsComponent;
  let fixture: ComponentFixture<SalesContractDetailsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SalesContractDetailsComponent]
    });
    fixture = TestBed.createComponent(SalesContractDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
