import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DocumentBranchComponent } from './document-branch.component';

describe('DocumentBranchComponent', () => {
  let component: DocumentBranchComponent;
  let fixture: ComponentFixture<DocumentBranchComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DocumentBranchComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DocumentBranchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
