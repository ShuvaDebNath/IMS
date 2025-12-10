import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InterliningDescCreateComponent } from './interlining-desc-create.component';

describe('InterliningDescCreateComponent', () => {
  let component: InterliningDescCreateComponent;
  let fixture: ComponentFixture<InterliningDescCreateComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [InterliningDescCreateComponent]
    });
    fixture = TestBed.createComponent(InterliningDescCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
