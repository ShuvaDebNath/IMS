import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WidthListComponent } from './width-list.component';

describe('WidthListComponent', () => {
  let component: WidthListComponent;
  let fixture: ComponentFixture<WidthListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [WidthListComponent]
    });
    fixture = TestBed.createComponent(WidthListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
