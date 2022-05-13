import { Component} from '@angular/core';
import { AutoLogoutService } from './core/autoLogOutService';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'safex-billing';
  constructor(
    // Inject service
    private autoLogout: AutoLogoutService
  ) {
  }
}


