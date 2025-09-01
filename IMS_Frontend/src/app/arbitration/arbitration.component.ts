import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component } from '@angular/core';

@Component({
  selector: 'app-arbitration',
  templateUrl: './arbitration.component.html',
  styleUrls: ['./arbitration.component.css']
})
export class ArbitrationComponent {
  goodsList: any[] = [];
  colors = ['Red', 'Blue', 'Green'];
  widths = ['Small', 'Medium', 'Large'];
  packages = ['Box', 'Bag', 'Packet'];
  units = ['Piece', 'Kg', 'Meter'];
  
  // Form properties
  articleNo!: string;
  color!: string;
  width!: string;
  package!: string;
  unit!: string;
  weight!: number;
  gsm!: number;
  isAvailable: boolean = false;
  
  columns = [
    { title: 'Article No', dataIndex: 'articleNo', key: 'articleNo' },
    { title: 'Color', dataIndex: 'color', key: 'color' },
    { title: 'Width', dataIndex: 'width', key: 'width' },
    { title: 'Package', dataIndex: 'package', key: 'package' },
    { title: 'Unit', dataIndex: 'unit', key: 'unit' },
    { title: 'Weight', dataIndex: 'weight', key: 'weight' },
    { title: 'GSM', dataIndex: 'gsm', key: 'gsm' },
    { title: 'Is Available', dataIndex: 'isAvailable', key: 'isAvailable' },
    { title: 'Action', dataIndex: 'action', key: 'action' }
  ];

  private apiUrl = 'http://localhost:5077/api/MasterEntry/Insert';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadGoods();
  }

  loadGoods(): void {
    const getApiUrl = 'http://localhost:5077/api/MasterEntry/GetAll';
    
    const headers = new HttpHeaders({
      'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJVc2VySWQiOiIxIiwiVXNlck5hbWUiOiJ2bGluayIsImp0aSI6ImM5MzNhY2Q2LTQyMDItNGJjYy1iMGVjLWNkNDZlNTA2NDMwZCIsIm5iZiI6MTc1Njc1MjMwMywiZXhwIjoxNzU2Nzk1NTAzLCJpc3MiOiJzaHV2YS5jb20iLCJhdWQiOiJzaHV2YS5jb20ifQ.qlicJLrOvTyPqQTHn3_LlDqXT0jsjT1Ccz_3XmIQaSE`,
      'Content-Type': 'application/json'
    });
 const newGoods = {
      tableName: "tbl_item",
      columnNames: "ArticleNo,Color,Width,Package,Unit,Weight,Gsm,IsAvailable",
      
      whereParams: ""
    };
    this.http.post<any[]>(getApiUrl,newGoods, { headers }).subscribe({
      next: (data) => {
        this.goodsList = data;
        console.log('Goods loaded successfully:', data);
      },
      error: (error) => {
        console.error('Error loading goods:', error);
      }
    });
  }

  onSubmit(): void {
    const newGoods = {
      tableName: "tbl_item",
      columnNames: "ArticleNo,Color,Width,Package,Unit,Weight,Gsm,IsAvailable",
      queryParams: 
        `ArticleNo=${this.articleNo},` +
        `Color=${this.color},` +
        `Width=${this.width},` +
        `Package=${this.package},` +
        `Unit=${this.unit},` +
        `Weight=${this.weight},` +
        `Gsm=${this.gsm},` +
        `IsAvailable=${this.isAvailable}`,
      whereParams: ""
    };

    const headers = new HttpHeaders({ 
      'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJVc2VySWQiOiIxIiwiVXNlck5hbWUiOiJ2bGluayIsImp0aSI6IjhiMTAzZjA0LTYwNzMtNDFmNy05NjE4LTBkNjkwMTY0NGQ1OCIsIm5iZiI6MTc1NjM2NjU0MiwiZXhwIjoxNzU2NDA5NzQyLCJpc3MiOiJzaHV2YS5jb20iLCJhdWQiOiJzaHV2YS5jb20ifQ.3VzMQ2adAAC5sNsOyaqnBSVPG8K3accelgZzmbmFKMQ`,
      'Content-Type': 'application/json'
    });

    this.http.post(this.apiUrl, newGoods, { headers }).subscribe({
      next: (response: any) => {
        console.log('Goods added successfully:', response);
        
        this.goodsList.push({
          articleNo: this.articleNo,
          color: this.color,
          width: this.width,
          package: this.package,
          unit: this.unit,
          weight: this.weight,
          gsm: this.gsm,
          isAvailable: this.isAvailable
        });
        
        this.resetForm();
        
        this.closeModal();
      },
      error: (error) => {
        console.error('Error adding goods:', error);
      }
    });
  }

  resetForm(): void {
    this.articleNo = '';
    this.color = '';
    this.width = '';
    this.package = '';
    this.unit = '';
    this.weight = 0;
    this.gsm = 0;
    this.isAvailable = false;
  }

  closeModal(): void {
    const modal = document.getElementById('goodsModal');
    if (modal) {
      // const bootstrapModal = require('bootstrap').Modal.getInstance(modal);
      // if (bootstrapModal) {
      //   bootstrapModal.hide();
      // }
    }
  }

  onEdit(item: any): void {
    console.log('Edit item:', item);
    this.articleNo = item.articleNo;
    this.color = item.color;
    this.width = item.width;
    this.package = item.package;
    this.unit = item.unit;
    this.weight = item.weight;
    this.gsm = item.gsm;
    this.isAvailable = item.isAvailable;
    
    this.openModal();
  }

  openModal(): void {
    const modal = document.getElementById('goodsModal');
    if (modal) {
      // const bootstrapModal = new (require('bootstrap').Modal)(modal);
      // bootstrapModal.show();
    }
  }

  get data(): any[] {
    return this.goodsList;
  }
}