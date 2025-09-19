import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GenerateBuyingHouseComponent } from './generate-buying-house.component';

describe('GenerateBuyingHouseComponent', () => {
  let component: GenerateBuyingHouseComponent;
  let fixture: ComponentFixture<GenerateBuyingHouseComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [GenerateBuyingHouseComponent]
    });
    fixture = TestBed.createComponent(GenerateBuyingHouseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
