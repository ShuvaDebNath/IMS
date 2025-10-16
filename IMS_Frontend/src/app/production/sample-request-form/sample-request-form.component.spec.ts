import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SampleRequestFormComponent } from './sample-request-form.component';

describe('SampleRequestFormComponent', () => {
  let component: SampleRequestFormComponent;
  let fixture: ComponentFixture<SampleRequestFormComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SampleRequestFormComponent]
    });
    fixture = TestBed.createComponent(SampleRequestFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
