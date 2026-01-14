import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FinishedGoodsListComponent } from './finished-goods-list.component';

describe('FinishedGoodsListComponent', () => {
  let component: FinishedGoodsListComponent;
  let fixture: ComponentFixture<FinishedGoodsListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [FinishedGoodsListComponent]
    });
    fixture = TestBed.createComponent(FinishedGoodsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
