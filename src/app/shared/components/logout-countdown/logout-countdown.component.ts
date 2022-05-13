import { Component, Inject, OnDestroy, OnInit, Pipe, PipeTransform } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Subscription, timer } from 'rxjs';

@Component({
  selector: 'app-logout-countdown',
  templateUrl: './logout-countdown.component.html',
  styleUrls: ['./logout-countdown.component.scss']
})
export class LogoutCountdownComponent implements OnInit, OnDestroy {

  countDown: Subscription;

  // counter: number = 5 * 60;
  counter: number;
  tick = 1000;

  constructor(
    public dialogRef: MatDialogRef<LogoutCountdownComponent>,
    @Inject(MAT_DIALOG_DATA) public data: number,
  ) {
    this.counter = data;
  }

  ngOnInit() {
    this.countDown = timer(0, this.tick).subscribe(
      () => {
        --this.counter;
        if(this.counter < 1) {
          this.dialogRef.close();
        }
      });
  }

  ngOnDestroy(){
    this.countDown=null;
  }
}

@Pipe({
  name: "formatTime"
})
export class FormatTimePipe implements PipeTransform {
  transform(value: number): string {
    const minutes: number = Math.floor(value / 60);
    return (
      ("00" + minutes).slice(-2) +
      ":" +
      ("00" + Math.floor(value - minutes * 60)).slice(-2)
    );
  }
}
