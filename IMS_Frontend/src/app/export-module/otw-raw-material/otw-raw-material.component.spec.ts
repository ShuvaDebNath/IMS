import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OtwRawMaterialComponent } from './otw-raw-material.component';

describe('OtwRawMaterialComponent', () => {
  let component: OtwRawMaterialComponent;
  let fixture: ComponentFixture<OtwRawMaterialComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [OtwRawMaterialComponent]
    });
    fixture = TestBed.createComponent(OtwRawMaterialComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
