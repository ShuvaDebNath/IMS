import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UnitCreateComponent } from './unit-create.component';

describe('UnitCreateComponent', () => {
  let component: UnitCreateComponent;
  let fixture: ComponentFixture<UnitCreateComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [UnitCreateComponent]
    });
    fixture = TestBed.createComponent(UnitCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
