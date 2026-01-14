import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DestinationPortCreateComponent } from './destination-port-create.component';

describe('DestinationPortCreateComponent', () => {
  let component: DestinationPortCreateComponent;
  let fixture: ComponentFixture<DestinationPortCreateComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DestinationPortCreateComponent]
    });
    fixture = TestBed.createComponent(DestinationPortCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
