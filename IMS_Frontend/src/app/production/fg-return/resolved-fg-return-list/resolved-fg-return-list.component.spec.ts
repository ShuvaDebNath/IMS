import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResolvedFgReturnListComponent } from './resolved-fg-return-list.component';

describe('ResolvedFgReturnListComponent', () => {
  let component: ResolvedFgReturnListComponent;
  let fixture: ComponentFixture<ResolvedFgReturnListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ResolvedFgReturnListComponent]
    });
    fixture = TestBed.createComponent(ResolvedFgReturnListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
