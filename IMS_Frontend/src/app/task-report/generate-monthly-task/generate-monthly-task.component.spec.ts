import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GenerateMonthlyTaskComponent } from './generate-monthly-task.component';

describe('GenerateMonthlyTaskComponent', () => {
  let component: GenerateMonthlyTaskComponent;
  let fixture: ComponentFixture<GenerateMonthlyTaskComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [GenerateMonthlyTaskComponent]
    });
    fixture = TestBed.createComponent(GenerateMonthlyTaskComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
