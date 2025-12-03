import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GenerateApplicationComponent } from './generate-application.component';

describe('GenerateApplicationComponent', () => {
  let component: GenerateApplicationComponent;
  let fixture: ComponentFixture<GenerateApplicationComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [GenerateApplicationComponent]
    });
    fixture = TestBed.createComponent(GenerateApplicationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
