import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoadingModeListComponent } from './loading-mode-list.component';

describe('LoadingModeListComponent', () => {
  let component: LoadingModeListComponent;
  let fixture: ComponentFixture<LoadingModeListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [LoadingModeListComponent]
    });
    fixture = TestBed.createComponent(LoadingModeListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
