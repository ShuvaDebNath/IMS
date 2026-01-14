import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PackagingListComponent } from './packaging-list.component';

describe('PackagingListComponent', () => {
  let component: PackagingListComponent;
  let fixture: ComponentFixture<PackagingListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PackagingListComponent]
    });
    fixture = TestBed.createComponent(PackagingListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
