import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PiAmendmentApplicationComponent } from './pi-amendment-application.component';

describe('PiAmendmentApplicationComponent', () => {
  let component: PiAmendmentApplicationComponent;
  let fixture: ComponentFixture<PiAmendmentApplicationComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PiAmendmentApplicationComponent]
    });
    fixture = TestBed.createComponent(PiAmendmentApplicationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
