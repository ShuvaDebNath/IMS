import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExchangeGoodsApplicationComponent } from './exchange-goods-application.component';

describe('ExchangeGoodsApplicationComponent', () => {
  let component: ExchangeGoodsApplicationComponent;
  let fixture: ComponentFixture<ExchangeGoodsApplicationComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ExchangeGoodsApplicationComponent]
    });
    fixture = TestBed.createComponent(ExchangeGoodsApplicationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
