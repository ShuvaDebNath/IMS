import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExportRawMaterialComponent } from './export-raw-material.component';

describe('ExportRawMaterialComponent', () => {
  let component: ExportRawMaterialComponent;
  let fixture: ComponentFixture<ExportRawMaterialComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ExportRawMaterialComponent]
    });
    fixture = TestBed.createComponent(ExportRawMaterialComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
