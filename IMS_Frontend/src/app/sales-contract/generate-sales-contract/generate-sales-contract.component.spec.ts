import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GenerateSalesContractComponent } from './generate-sales-contract.component';

describe('GenerateSalesContractComponent', () => {
  let component: GenerateSalesContractComponent;
  let fixture: ComponentFixture<GenerateSalesContractComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [GenerateSalesContractComponent]
    });
    fixture = TestBed.createComponent(GenerateSalesContractComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
