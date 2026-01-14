import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GoodsDescCreateComponent } from './goods-desc-create.component';

describe('GoodsDescCreateComponent', () => {
  let component: GoodsDescCreateComponent;
  let fixture: ComponentFixture<GoodsDescCreateComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [GoodsDescCreateComponent]
    });
    fixture = TestBed.createComponent(GoodsDescCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
