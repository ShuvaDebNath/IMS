import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PendingFgReturnListComponent } from './pending-fg-return-list.component';

describe('PendingFgReturnListComponent', () => {
  let component: PendingFgReturnListComponent;
  let fixture: ComponentFixture<PendingFgReturnListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PendingFgReturnListComponent]
    });
    fixture = TestBed.createComponent(PendingFgReturnListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
