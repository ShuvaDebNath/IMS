import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PriceTermsCreateComponent } from './price-terms-create.component';

describe('PriceTermsCreateComponent', () => {
  let component: PriceTermsCreateComponent;
  let fixture: ComponentFixture<PriceTermsCreateComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PriceTermsCreateComponent]
    });
    fixture = TestBed.createComponent(PriceTermsCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
