import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchRoleComponent } from './search-role.component';

describe('SearchRoleComponent', () => {
  let component: SearchRoleComponent;
  let fixture: ComponentFixture<SearchRoleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SearchRoleComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchRoleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
