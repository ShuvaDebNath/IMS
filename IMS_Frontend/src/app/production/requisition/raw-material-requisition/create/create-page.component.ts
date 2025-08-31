// Create Page Component
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-create-page',
  templateUrl: './create-page.component.html',
  styleUrls: ['./create-page.component.css']
})
export class CreatePageComponent implements OnInit {
  requisitionData: any[] = [];

  ngOnInit(): void {
    this.loadPageData();
  }

  loadPageData(): void {
    // Logic to load initial data for the page
    console.log('Page data loaded');
  }

  addRow(): void {
    this.requisitionData.push({
      article: '',
      description: '',
      color: '',
      width: '',
      weight: '',
      unit: '',
      qty: '',
      rollBag: '',
      rollBagQty: ''
    });
  }

  deleteRow(index: number): void {
    this.requisitionData.splice(index, 1);
  }

  saveData(): void {
    // Logic to save the requisition data
  }
}
