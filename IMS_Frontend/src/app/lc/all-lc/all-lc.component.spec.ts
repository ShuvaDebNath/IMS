import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AllLcComponent } from './all-lc.component';

describe('AllLcComponent', () => {
  let component: AllLcComponent;
  let fixture: ComponentFixture<AllLcComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AllLcComponent]
    });
    fixture = TestBed.createComponent(AllLcComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
