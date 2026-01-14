import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoadingPortListComponent } from './loading-port-list.component';

describe('LoadingPortListComponent', () => {
  let component: LoadingPortListComponent;
  let fixture: ComponentFixture<LoadingPortListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [LoadingPortListComponent]
    });
    fixture = TestBed.createComponent(LoadingPortListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
