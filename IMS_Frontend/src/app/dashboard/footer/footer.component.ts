import { Component, OnInit } from '@angular/core';
import { AppStateService } from 'src/app/services/session/app-state.service';
import { take, filter } from 'rxjs/operators';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent implements OnInit {

  showFooter = false;
  currentYear = new Date().getFullYear();

  constructor(private appState: AppStateService) {}

  ngOnInit(): void {
    this.appState.ready$
      .pipe(filter(ready => ready), take(1))
      .subscribe(() => {
        this.showFooter = true;
      });
  }
}