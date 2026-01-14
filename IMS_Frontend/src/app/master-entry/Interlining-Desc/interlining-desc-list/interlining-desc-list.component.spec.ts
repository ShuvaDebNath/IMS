import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InterliningDescListComponent } from './interlining-desc-list.component';

describe('InterliningDescListComponent', () => {
  let component: InterliningDescListComponent;
  let fixture: ComponentFixture<InterliningDescListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [InterliningDescListComponent]
    });
    fixture = TestBed.createComponent(InterliningDescListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
