import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoadingModeCreateComponent } from './loading-mode-create.component';

describe('LoadingModeCreateComponent', () => {
  let component: LoadingModeCreateComponent;
  let fixture: ComponentFixture<LoadingModeCreateComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [LoadingModeCreateComponent]
    });
    fixture = TestBed.createComponent(LoadingModeCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
