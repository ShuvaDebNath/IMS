import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GenerateTaskReportComponent } from './generate-task-report.component';

describe('GenerateTaskReportComponent', () => {
  let component: GenerateTaskReportComponent;
  let fixture: ComponentFixture<GenerateTaskReportComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [GenerateTaskReportComponent]
    });
    fixture = TestBed.createComponent(GenerateTaskReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
