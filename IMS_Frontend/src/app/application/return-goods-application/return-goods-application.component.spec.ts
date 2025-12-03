import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReturnGoodsApplicationComponent } from './return-goods-application.component';

describe('ReturnGoodsApplicationComponent', () => {
  let component: ReturnGoodsApplicationComponent;
  let fixture: ComponentFixture<ReturnGoodsApplicationComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ReturnGoodsApplicationComponent]
    });
    fixture = TestBed.createComponent(ReturnGoodsApplicationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
