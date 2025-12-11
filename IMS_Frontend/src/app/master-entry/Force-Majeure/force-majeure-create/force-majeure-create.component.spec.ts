import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ForceMajeureCreateComponent } from './force-majeure-create.component';

describe('ForceMajeureCreateComponent', () => {
  let component: ForceMajeureCreateComponent;
  let fixture: ComponentFixture<ForceMajeureCreateComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ForceMajeureCreateComponent]
    });
    fixture = TestBed.createComponent(ForceMajeureCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
