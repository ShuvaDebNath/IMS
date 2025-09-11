import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeliveredPiComponent } from './delivered-pi.component';

describe('DeliveredPiComponent', () => {
  let component: DeliveredPiComponent;
  let fixture: ComponentFixture<DeliveredPiComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DeliveredPiComponent]
    });
    fixture = TestBed.createComponent(DeliveredPiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
