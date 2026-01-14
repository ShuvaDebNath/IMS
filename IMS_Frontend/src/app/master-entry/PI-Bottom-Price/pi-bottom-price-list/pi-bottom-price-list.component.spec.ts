import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PIBottomPriceListComponent } from './pi-bottom-price-list.component';

describe('PIBottomPriceListComponent', () => {
  let component: PIBottomPriceListComponent;
  let fixture: ComponentFixture<PIBottomPriceListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PIBottomPriceListComponent]
    });
    fixture = TestBed.createComponent(PIBottomPriceListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
