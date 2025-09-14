import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UnapprovedBuyingHouseComponent } from './unapproved-buying-house.component';

describe('UnapprovedBuyingHouseComponent', () => {
  let component: UnapprovedBuyingHouseComponent;
  let fixture: ComponentFixture<UnapprovedBuyingHouseComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [UnapprovedBuyingHouseComponent]
    });
    fixture = TestBed.createComponent(UnapprovedBuyingHouseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
