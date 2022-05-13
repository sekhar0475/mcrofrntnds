import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmationSuccessDialogComponent } from './confirmation-success-dialog.component';

describe('ConfirmationSuccessDialogComponent', () => {
  let component: ConfirmationSuccessDialogComponent;
  let fixture: ComponentFixture<ConfirmationSuccessDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConfirmationSuccessDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfirmationSuccessDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
