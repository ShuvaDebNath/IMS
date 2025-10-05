import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CurrencyCreateComponent } from './currency-create.component';

describe('CurrencyCreateComponent', () => {
  let component: CurrencyCreateComponent;
  let fixture: ComponentFixture<CurrencyCreateComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CurrencyCreateComponent]
    });
    fixture = TestBed.createComponent(CurrencyCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
