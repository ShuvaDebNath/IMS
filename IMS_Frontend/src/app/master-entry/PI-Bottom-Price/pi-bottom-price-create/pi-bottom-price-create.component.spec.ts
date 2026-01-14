import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PIBottomPriceCreateComponent } from './pi-bottom-price-create.component';

describe('PIBottomPriceCreateComponent', () => {
  let component: PIBottomPriceCreateComponent;
  let fixture: ComponentFixture<PIBottomPriceCreateComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PIBottomPriceCreateComponent]
    });
    fixture = TestBed.createComponent(PIBottomPriceCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
