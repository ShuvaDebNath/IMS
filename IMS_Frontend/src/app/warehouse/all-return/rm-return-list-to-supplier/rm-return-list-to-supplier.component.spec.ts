import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RmReturnListToSupplierComponent } from './rm-return-list-to-supplier.component';

describe('RmReturnListToSupplierComponent', () => {
  let component: RmReturnListToSupplierComponent;
  let fixture: ComponentFixture<RmReturnListToSupplierComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [RmReturnListToSupplierComponent]
    });
    fixture = TestBed.createComponent(RmReturnListToSupplierComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
