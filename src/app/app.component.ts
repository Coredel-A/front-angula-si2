import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AutoRefreshService } from './services/auto-refresh.service';

@Component({
    selector: 'app-root',
    imports: [RouterOutlet],
    templateUrl: './app.component.html'
})
export class AppComponent {
  title = 'MaterialPro Angular Admin Template';
  constructor(private autoRefresh: AutoRefreshService) {}
}
