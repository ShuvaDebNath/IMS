import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SampleRequestInsertFormComponent } from './sample-request-insert-form.component';

describe('SampleRequestInsertFormComponent', () => {
  let component: SampleRequestInsertFormComponent;
  let fixture: ComponentFixture<SampleRequestInsertFormComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SampleRequestInsertFormComponent]
    });
    fixture = TestBed.createComponent(SampleRequestInsertFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
