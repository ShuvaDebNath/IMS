import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BarcodeGenerateComponent } from './barcode-generate.component';

describe('BarcodeGenerateComponent', () => {
  let component: BarcodeGenerateComponent;
  let fixture: ComponentFixture<BarcodeGenerateComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [BarcodeGenerateComponent]
    });
    fixture = TestBed.createComponent(BarcodeGenerateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
