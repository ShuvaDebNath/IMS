import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CancelPiApplicationComponent } from './cancel-pi-application.component';

describe('CancelPiApplicationComponent', () => {
  let component: CancelPiApplicationComponent;
  let fixture: ComponentFixture<CancelPiApplicationComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CancelPiApplicationComponent]
    });
    fixture = TestBed.createComponent(CancelPiApplicationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
