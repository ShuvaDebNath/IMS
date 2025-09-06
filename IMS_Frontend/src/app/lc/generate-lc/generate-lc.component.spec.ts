import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GenerateLcComponent } from './generate-lc.component';

describe('GenerateLcComponent', () => {
  let component: GenerateLcComponent;
  let fixture: ComponentFixture<GenerateLcComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [GenerateLcComponent]
    });
    fixture = TestBed.createComponent(GenerateLcComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
