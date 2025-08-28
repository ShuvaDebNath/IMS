import { Component, OnInit } from '@angular/core';
import { ScrollerOptions, SelectItem } from 'primeng/api';
import { DdlLazyloadingService } from 'src/app/services/lazyloading/ddlLazyloading.service';


@Component({
  selector: 'app-generate-pi',
  templateUrl: './generate-pi.component.html',
  styleUrls: ['./generate-pi.component.css'],

})
export class GeneratePiComponent implements OnInit {

  items: SelectItem[] = [];
  selectedItem: any;
  loading: boolean = false;

    constructor(private dllService:DdlLazyloadingService) {
       
    }
  ngOnInit(): void {
    
  }

  loadData(event: { first: number; last: number; filter?: string }) {
    this.loading = true;

    const rows = event.last - event.first;
    const filter = event.filter || ''; 
    console.clear();
    console.log(filter);
    console.log(rows);
    console.log(event.first);

    this.dllService.GetCountryDDLLazyLoad(event.first, rows, filter).subscribe({
      next: (data: any) => {
        console.log(data);
        // this.items = data.map(data => ({
        //   label: city.name,
        //   value: city.id
        // }));
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }
}
    