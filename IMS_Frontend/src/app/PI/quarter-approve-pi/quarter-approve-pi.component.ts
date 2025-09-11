import { Component, OnInit } from '@angular/core';
import { PiListComponent } from '../pi-list/pi-list.component';

@Component({
  standalone:true,
  selector: 'app-quarter-approve-pi',
  templateUrl: './quarter-approve-pi.component.html',
  styleUrls: ['./quarter-approve-pi.component.css'],
  imports:[PiListComponent]
})
export class QuarterApprovePiComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
