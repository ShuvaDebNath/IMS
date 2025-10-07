import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResolvedReturnListComponent } from './resolved-return-list.component';

describe('ResolvedReturnListComponent', () => {
  let component: ResolvedReturnListComponent;
  let fixture: ComponentFixture<ResolvedReturnListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ResolvedReturnListComponent]
    });
    fixture = TestBed.createComponent(ResolvedReturnListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
