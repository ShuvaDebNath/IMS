import { Component, HostListener, OnInit } from '@angular/core';
import { setTheme } from 'ngx-bootstrap/utils';
import { TreeTableModule } from 'primeng/treetable';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

@HostListener('window:message', ['$event'])
export class AppComponent implements OnInit {
  constructor() {
    setTheme('bs4');
  }

  ngOnInit(): void {
  }
  onMessage(e: any) {
debugger;

    if (e.origin == "http://localhost:4200/login") {
      localStorage.setItem('token', JSON.stringify(e.data));
    } else {
      return false;
    }
    return true;
  }
  title = 'IMSFrontEnd';
}
