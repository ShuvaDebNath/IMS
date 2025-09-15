import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ArbitrationCreateComponent } from './arbitration-create.component';

describe('ArbitrationCreateComponent', () => {
  let component: ArbitrationCreateComponent;
  let fixture: ComponentFixture<ArbitrationCreateComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ArbitrationCreateComponent]
    });
    fixture = TestBed.createComponent(ArbitrationCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
