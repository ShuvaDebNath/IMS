import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccessNodeComponent } from './access-node.component';

describe('AccessNodeComponent', () => {
  let component: AccessNodeComponent;
  let fixture: ComponentFixture<AccessNodeComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AccessNodeComponent]
    });
    fixture = TestBed.createComponent(AccessNodeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
