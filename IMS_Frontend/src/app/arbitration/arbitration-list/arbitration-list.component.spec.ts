import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ArbitrationListComponent } from './arbitration-list.component';

describe('ArbitrationListComponent', () => {
  let component: ArbitrationListComponent;
  let fixture: ComponentFixture<ArbitrationListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ArbitrationListComponent]
    });
    fixture = TestBed.createComponent(ArbitrationListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
