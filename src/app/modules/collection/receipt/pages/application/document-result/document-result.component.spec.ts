import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DocumentResultComponent } from './document-result.component';

describe('DocumentResultComponent', () => {
  let component: DocumentResultComponent;
  let fixture: ComponentFixture<DocumentResultComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DocumentResultComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DocumentResultComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
