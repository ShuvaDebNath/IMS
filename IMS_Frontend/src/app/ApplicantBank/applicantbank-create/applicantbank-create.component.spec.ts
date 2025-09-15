import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApplicantbankCreateComponent } from './applicantbank-create.component';

describe('ApplicantbankCreateComponent', () => {
  let component: ApplicantbankCreateComponent;
  let fixture: ComponentFixture<ApplicantbankCreateComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ApplicantbankCreateComponent]
    });
    fixture = TestBed.createComponent(ApplicantbankCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
