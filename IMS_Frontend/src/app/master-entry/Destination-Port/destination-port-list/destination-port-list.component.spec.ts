import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DestinationPortListComponent } from './destination-port-list.component';

describe('DestinationPortListComponent', () => {
  let component: DestinationPortListComponent;
  let fixture: ComponentFixture<DestinationPortListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DestinationPortListComponent]
    });
    fixture = TestBed.createComponent(DestinationPortListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
