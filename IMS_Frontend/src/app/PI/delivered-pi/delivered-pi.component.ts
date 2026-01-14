import { Component, OnInit } from '@angular/core';
import { PiListComponent } from '../pi-list/pi-list.component';

@Component({
   standalone:true,
  selector: 'app-delivered-pi',
  templateUrl: './delivered-pi.component.html',
  styleUrls: ['./delivered-pi.component.css'],
  imports:[PiListComponent]
})
export class DeliveredPiComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}