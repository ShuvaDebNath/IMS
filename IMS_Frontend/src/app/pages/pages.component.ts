import { Component, OnInit, HostListener } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GlobalServiceService } from '../services/Global-service.service';
import { Title } from '@angular/platform-browser';
import { AppStateService } from '../services/session/app-state.service';

@Component({
  selector: 'app-pages',
  templateUrl: './pages.component.html',
  styleUrls: ['./pages.component.css'],
})
export class PagesComponent implements OnInit {
  loaderstatus:any = false;
  userWiseLedger:any = [];
  /** When false, the full-page preloader (spinner) is shown. Set true when app state is ready so dashboard can render. */
  appReady = false;

  constructor(private router: Router, private gs: GlobalServiceService,private readonly titleService: Title,private route:ActivatedRoute, private appState: AppStateService) {
    gs.CheckToken();
    // If we're already on a protected route with token + menu (e.g. after refresh), mark app ready so layout loads
    if (window.localStorage.getItem('token') && window.localStorage.getItem('UserMenu')) {
      this.appState.markReady();
    }
  }

  ngOnInit(): void {
    // Hide preloader when app is ready (after login or when restored from storage)
    this.appState.ready$.subscribe(ready => {
      this.appReady = ready;
    });

    this.route.firstChild?.params.subscribe(params => {
   });
    this.titleService.setTitle(this.route.snapshot.data['title']);
  }

  @HostListener('window:keyup', ['$event'])
  keyEvent(event: KeyboardEvent) {
    if (event.ctrlKey) {
      let k = event.key;
      switch (k) {
        case 'm':
          this.router.navigate(['/debit-voucher']);
          break;
        case ',':
          this.router.navigate(['/credit-voucher']);
          break;
        case '.':
          this.router.navigate(['/journal-voucher']);
          break;
        case '/':
          this.router.navigate(['/contra-voucher']);
          break;
      }
    }
  }


}
