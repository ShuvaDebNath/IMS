import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StockLocationListComponent } from './stock-location-list.component';

describe('StockLocationListComponent', () => {
  let component: StockLocationListComponent;
  let fixture: ComponentFixture<StockLocationListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [StockLocationListComponent]
    });
    fixture = TestBed.createComponent(StockLocationListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
