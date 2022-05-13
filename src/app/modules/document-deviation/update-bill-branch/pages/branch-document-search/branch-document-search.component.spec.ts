import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BranchDocumentSearchComponent } from './branch-document-search.component';

describe('BranchDocumentSearchComponent', () => {
  let component: BranchDocumentSearchComponent;
  let fixture: ComponentFixture<BranchDocumentSearchComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BranchDocumentSearchComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BranchDocumentSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
