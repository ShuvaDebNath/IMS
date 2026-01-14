import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ForceMajeureListComponent } from './force-majeure-list.component';

describe('ForceMajeureListComponent', () => {
  let component: ForceMajeureListComponent;
  let fixture: ComponentFixture<ForceMajeureListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ForceMajeureListComponent]
    });
    fixture = TestBed.createComponent(ForceMajeureListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
