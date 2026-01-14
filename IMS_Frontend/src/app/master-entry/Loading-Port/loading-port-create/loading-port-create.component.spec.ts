import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoadingPortCreateComponent } from './loading-port-create.component';

describe('LoadingPortCreateComponent', () => {
  let component: LoadingPortCreateComponent;
  let fixture: ComponentFixture<LoadingPortCreateComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [LoadingPortCreateComponent]
    });
    fixture = TestBed.createComponent(LoadingPortCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
