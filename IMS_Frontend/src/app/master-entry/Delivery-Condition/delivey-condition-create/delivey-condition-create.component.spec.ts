import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeliveyConditionCreateComponent } from './delivey-condition-create.component';

describe('DeliveyConditionCreateComponent', () => {
  let component: DeliveyConditionCreateComponent;
  let fixture: ComponentFixture<DeliveyConditionCreateComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DeliveyConditionCreateComponent]
    });
    fixture = TestBed.createComponent(DeliveyConditionCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
