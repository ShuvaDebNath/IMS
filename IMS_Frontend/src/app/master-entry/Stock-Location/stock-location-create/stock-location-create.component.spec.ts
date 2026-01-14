import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StockLocationCreateComponent } from './stock-location-create.component';

describe('StockLocationCreateComponent', () => {
  let component: StockLocationCreateComponent;
  let fixture: ComponentFixture<StockLocationCreateComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [StockLocationCreateComponent]
    });
    fixture = TestBed.createComponent(StockLocationCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
