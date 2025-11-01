import { Component, OnInit } from '@angular/core';
import { PiListComponent } from '../pi-list/pi-list.component';

@Component({
   standalone:true,
  selector: 'app-all-pi',
  templateUrl: './all-pi.component.html',
  styleUrls: ['./all-pi.component.css'],
  imports:[PiListComponent]
})
export class AllPiComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
