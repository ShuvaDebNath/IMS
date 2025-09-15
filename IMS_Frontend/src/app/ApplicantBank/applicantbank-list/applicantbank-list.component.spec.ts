import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApplicantbankListComponent } from './applicantbank-list.component';

describe('ApplicantbankListComponent', () => {
  let component: ApplicantbankListComponent;
  let fixture: ComponentFixture<ApplicantbankListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ApplicantbankListComponent]
    });
    fixture = TestBed.createComponent(ApplicantbankListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
