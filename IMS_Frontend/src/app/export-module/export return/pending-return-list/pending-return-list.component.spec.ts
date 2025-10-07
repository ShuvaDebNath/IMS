import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PendingReturnListComponent } from './pending-return-list.component';

describe('PendingReturnListComponent', () => {
  let component: PendingReturnListComponent;
  let fixture: ComponentFixture<PendingReturnListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PendingReturnListComponent]
    });
    fixture = TestBed.createComponent(PendingReturnListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
