import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FinalizeSearchComponent } from './finalize-search.component';

describe('FinalizeSearchComponent', () => {
  let component: FinalizeSearchComponent;
  let fixture: ComponentFixture<FinalizeSearchComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FinalizeSearchComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FinalizeSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
