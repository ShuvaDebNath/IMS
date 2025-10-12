import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImportedRmListComponent } from './imported-rm-list.component';

describe('ImportedRmListComponent', () => {
  let component: ImportedRmListComponent;
  let fixture: ComponentFixture<ImportedRmListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ImportedRmListComponent]
    });
    fixture = TestBed.createComponent(ImportedRmListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
