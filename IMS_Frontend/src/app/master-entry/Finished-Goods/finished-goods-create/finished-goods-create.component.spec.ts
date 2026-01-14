import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FinishedGoodsCreateComponent } from './finished-goods-create.component';

describe('FinishedGoodsCreateComponent', () => {
  let component: FinishedGoodsCreateComponent;
  let fixture: ComponentFixture<FinishedGoodsCreateComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [FinishedGoodsCreateComponent]
    });
    fixture = TestBed.createComponent(FinishedGoodsCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
