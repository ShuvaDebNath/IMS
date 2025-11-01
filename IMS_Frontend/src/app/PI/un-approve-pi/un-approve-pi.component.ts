import { Component, OnInit } from '@angular/core';
import { PiListComponent } from '../pi-list/pi-list.component';

@Component({
  standalone:true,
  selector: 'app-un-approve-pi',
  templateUrl: './un-approve-pi.component.html',
  styleUrls: ['./un-approve-pi.component.css'],
  imports: [PiListComponent]
})
export class UnApprovePiComponent implements OnInit {
  constructor(){}
  ngOnInit(): void {
    
  }



}
