import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReviewSearchComponent } from './review-search.component';

describe('HeaderSearchComponent', () => {
  let component: ReviewSearchComponent;
  let fixture: ComponentFixture<ReviewSearchComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReviewSearchComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReviewSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
