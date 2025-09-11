import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GenerateCashReceiveComponent } from './generate-cash-receive.component';

describe('GenerateCashReceiveComponent', () => {
  let component: GenerateCashReceiveComponent;
  let fixture: ComponentFixture<GenerateCashReceiveComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [GenerateCashReceiveComponent]
    });
    fixture = TestBed.createComponent(GenerateCashReceiveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
