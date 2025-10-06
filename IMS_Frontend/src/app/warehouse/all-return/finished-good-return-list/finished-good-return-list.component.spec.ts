import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FinishedGoodReturnListComponent } from './finished-good-return-list.component';

describe('FinishedGoodReturnListComponent', () => {
  let component: FinishedGoodReturnListComponent;
  let fixture: ComponentFixture<FinishedGoodReturnListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [FinishedGoodReturnListComponent]
    });
    fixture = TestBed.createComponent(FinishedGoodReturnListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
