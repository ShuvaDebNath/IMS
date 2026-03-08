import { Component, OnInit } from '@angular/core';
import { GlobalServiceService } from '../../services/Global-service.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { Title } from '@angular/platform-browser';
import { AppStateService } from 'src/app/services/session/app-state.service';

@Component({
  selector: 'app-base-content',
  templateUrl: './base-content.component.html',
  styleUrls: ['./base-content.component.css'],
})
export class BaseContentComponent implements OnInit {
  loaderstatus:boolean = true;
  constructor(
    private title:Title,
    private appState: AppStateService
  ) {
    
  }

  ngOnInit() {
    this.title.setTitle('Dashboard');
    this.appState.ready$.subscribe(isReady => {
    if (isReady) {
      this.loaderstatus = false;
    }
  });
  }
}
