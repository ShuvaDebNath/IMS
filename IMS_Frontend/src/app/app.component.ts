import { Component, OnInit } from '@angular/core';
import { setTheme } from 'ngx-bootstrap/utils';
import { SessionService } from './services/session/session.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'IMSFrontEnd';

  constructor(private sessionService: SessionService) {
    setTheme('bs4');
  }

  ngOnInit(): void {}
}
