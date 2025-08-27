import { Component, OnInit } from '@angular/core';
import { GlobalServiceService } from '../../services/Global-service.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { Title } from '@angular/platform-browser';
@Component({
  selector: 'app-base-content',
  templateUrl: './base-content.component.html',
  styleUrls: ['./base-content.component.css'],
})
export class BaseContentComponent implements OnInit {
  loaderstatus:boolean = true;
  constructor(
    private gs: GlobalServiceService,
    private activeLink: ActivatedRoute,
    private router: Router,
    private location: Location,
    private title:Title
  ) {
    // let has = this.activeLink.snapshot.queryParamMap.has('token');
    // if (has) {
    //   let token = this.activeLink.snapshot.queryParams['token'];
    //   window.localStorage.setItem('usermanagetoken', token);
    //   let url = this.router.url.split('?')[0];
    //   this.location.replaceState(url);
    //   this.gs.GetAccessToken(token).subscribe();
    // }else{
    //   this.gs.CheckToken().subscribe();
    // }
  }

  ngOnInit() {
    this.title.setTitle('Dashboard');
  }
}
