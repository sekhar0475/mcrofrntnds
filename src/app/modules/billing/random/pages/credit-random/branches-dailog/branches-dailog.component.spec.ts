import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BranchesDailogComponent } from './branches-dailog.component';

describe('BranchesDailogComponent', () => {
  let component: BranchesDailogComponent;
  let fixture: ComponentFixture<BranchesDailogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BranchesDailogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BranchesDailogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
