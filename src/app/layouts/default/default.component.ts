import { Component, OnInit, ChangeDetectorRef, OnDestroy, Input } from '@angular/core';
import { MediaMatcher } from '@angular/cdk/layout';

@Component({
  selector: 'app-default',
  templateUrl: './default.component.html',
  styleUrls: ['./default.component.scss']
})
export class DefaultComponent implements OnInit, OnDestroy {
  sideBarOpen = false;
  mobileQuery: MediaQueryList;
  private _mobileQueryListener: () => void;
  constructor(changeDetectorRef: ChangeDetectorRef
            , media: MediaMatcher) {
    this.mobileQuery = media.matchMedia('(max-width: 960px)');
    this._mobileQueryListener = () => changeDetectorRef.detectChanges();
    this.mobileQuery.addListener(this._mobileQueryListener);
  }

  ngOnInit() {
  }

  ngOnDestroy(): void {
    this.mobileQuery.removeListener(this._mobileQueryListener);
  }

  sideBarToggler() {
    this.sideBarOpen = !this.sideBarOpen;
  }

}
