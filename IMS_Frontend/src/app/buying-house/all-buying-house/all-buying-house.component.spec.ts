import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AllBuyingHouseComponent } from './all-buying-house.component';

describe('AllBuyingHouseComponent', () => {
  let component: AllBuyingHouseComponent;
  let fixture: ComponentFixture<AllBuyingHouseComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AllBuyingHouseComponent]
    });
    fixture = TestBed.createComponent(AllBuyingHouseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
