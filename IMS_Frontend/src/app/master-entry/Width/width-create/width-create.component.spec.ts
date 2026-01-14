import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WidthCreateComponent } from './width-create.component';

describe('WidthCreateComponent', () => {
  let component: WidthCreateComponent;
  let fixture: ComponentFixture<WidthCreateComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [WidthCreateComponent]
    });
    fixture = TestBed.createComponent(WidthCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
