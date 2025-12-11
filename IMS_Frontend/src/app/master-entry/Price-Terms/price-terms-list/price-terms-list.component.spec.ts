import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PriceTermsListComponent } from './price-terms-list.component';

describe('PriceTermsListComponent', () => {
  let component: PriceTermsListComponent;
  let fixture: ComponentFixture<PriceTermsListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PriceTermsListComponent]
    });
    fixture = TestBed.createComponent(PriceTermsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
