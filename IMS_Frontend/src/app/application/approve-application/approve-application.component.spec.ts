import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApproveApplicationComponent } from './approve-application.component';

describe('ApproveApplicationComponent', () => {
  let component: ApproveApplicationComponent;
  let fixture: ComponentFixture<ApproveApplicationComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ApproveApplicationComponent]
    });
    fixture = TestBed.createComponent(ApproveApplicationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
