import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GoodsDescListComponent } from './goods-desc-list.component';

describe('GoodsDescListComponent', () => {
  let component: GoodsDescListComponent;
  let fixture: ComponentFixture<GoodsDescListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [GoodsDescListComponent]
    });
    fixture = TestBed.createComponent(GoodsDescListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
