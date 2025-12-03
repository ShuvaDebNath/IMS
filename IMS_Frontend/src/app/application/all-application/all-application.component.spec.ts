import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AllApplicationComponent } from './all-application.component';

describe('AllApplicationComponent', () => {
  let component: AllApplicationComponent;
  let fixture: ComponentFixture<AllApplicationComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AllApplicationComponent]
    });
    fixture = TestBed.createComponent(AllApplicationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
