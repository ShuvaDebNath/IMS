import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GenerateCustomerVisitComponent } from './generate-customer-visit.component';

describe('GenerateCustomerVisitComponent', () => {
  let component: GenerateCustomerVisitComponent;
  let fixture: ComponentFixture<GenerateCustomerVisitComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [GenerateCustomerVisitComponent]
    });
    fixture = TestBed.createComponent(GenerateCustomerVisitComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
