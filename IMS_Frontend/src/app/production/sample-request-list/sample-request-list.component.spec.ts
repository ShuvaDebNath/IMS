import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SampleRequestListComponent } from './sample-request-list.component';

describe('SampleRequestListComponent', () => {
  let component: SampleRequestListComponent;
  let fixture: ComponentFixture<SampleRequestListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SampleRequestListComponent]
    });
    fixture = TestBed.createComponent(SampleRequestListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
