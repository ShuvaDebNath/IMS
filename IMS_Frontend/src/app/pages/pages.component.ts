import { Component, OnInit, HostListener } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GlobalServiceService } from '../services/Global-service.service';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-pages',
  templateUrl: './pages.component.html',
  styleUrls: ['./pages.component.css'],
})
export class PagesComponent implements OnInit {
  loaderstatus:any = false;
  userWiseLedger:any = [];
  constructor(private router: Router, private gs: GlobalServiceService,private readonly titleService: Title,private route:ActivatedRoute) {
    gs.CheckToken();
  }

  ngOnInit(): void {

    this.route.firstChild?.params.subscribe(params => {


   });
    this.titleService.setTitle(this.route.snapshot.data['title'])
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
