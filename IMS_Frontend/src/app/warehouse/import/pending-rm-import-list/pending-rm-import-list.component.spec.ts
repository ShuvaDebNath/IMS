import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PendingRmImportListComponent } from './pending-rm-import-list.component';

describe('PendingRmImportListComponent', () => {
  let component: PendingRmImportListComponent;
  let fixture: ComponentFixture<PendingRmImportListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PendingRmImportListComponent]
    });
    fixture = TestBed.createComponent(PendingRmImportListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
