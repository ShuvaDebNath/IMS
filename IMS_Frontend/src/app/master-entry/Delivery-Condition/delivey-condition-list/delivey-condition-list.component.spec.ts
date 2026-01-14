import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeliveyConditionListComponent } from './delivey-condition-list.component';

describe('DeliveyConditionListComponent', () => {
  let component: DeliveyConditionListComponent;
  let fixture: ComponentFixture<DeliveyConditionListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DeliveyConditionListComponent]
    });
    fixture = TestBed.createComponent(DeliveyConditionListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
