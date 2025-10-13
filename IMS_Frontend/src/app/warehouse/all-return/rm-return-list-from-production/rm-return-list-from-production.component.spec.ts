import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RmReturnListFromProductionComponent } from './rm-return-list-from-production.component';

describe('RmReturnListFromProductionComponent', () => {
  let component: RmReturnListFromProductionComponent;
  let fixture: ComponentFixture<RmReturnListFromProductionComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [RmReturnListFromProductionComponent]
    });
    fixture = TestBed.createComponent(RmReturnListFromProductionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
