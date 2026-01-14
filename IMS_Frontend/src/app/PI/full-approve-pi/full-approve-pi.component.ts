import { Component, OnInit } from '@angular/core';
import { PiListComponent } from '../pi-list/pi-list.component';

@Component({
   standalone:true,
  selector: 'app-full-approve-pi',
  templateUrl: './full-approve-pi.component.html',
  styleUrls: ['./full-approve-pi.component.css'],
  imports: [PiListComponent],
  //imports:[PiListComponent]
})
export class FullApprovePiComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
