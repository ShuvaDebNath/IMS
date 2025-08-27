import { FormArray } from '@angular/forms';

export class GlobalClass {

  static CalculateRows(formArray: FormArray) {
    let items = formArray.value;
    let cr:number = 0;
    let dr:number = 0;
    let crItem = items.filter(
      (o: { transactionType: string }) => o.transactionType == 'CR'
    );
    let drItem = items.filter(
      (o: { transactionType: string }) => o.transactionType == 'DR'
    );
    crItem.forEach((value: any) => {
      cr += parseFloat((value.totalAmount+'').replace(/,/g,''));
    });
    drItem.forEach((value: any) => {
      dr += parseFloat((value.totalAmount+'').replace(/,/g,''));
    });
    let res = { CR: cr, DR: dr };
    return res;
  }

  static GetFGItemList(){
    let itemList=[
      {value:'PSF',text:'PSF'},
      {value:'PET Recycled Pellets',text:'PET Recycled Pellets'},
      {value:'Mask',text:'Mask'},
      {value:'InterliningNF',text:'InterliningNF'},
      {value:'InterliningNonFusibleFG',text:'InterliningNonFusibleFG'},
      {value:'InterliningDF',text:'InterliningDF'}
    ];

    return itemList;
  }

  static GetClientType(){
    let itemList=[
      {value:'local',text:'Local'},
      {value:'export',text:'Export'}
    ];

    return itemList;
  }

  static GetFormatedDate(dt:any){
    if(typeof(dt) == 'object'){
      let formattedDate = dt.getDate() + "/" + (dt.getMonth()+1) +"/" + dt.getFullYear();
      return formattedDate;
    }
    else{
      return dt;
    }
  }
  static formatWithCommas(value: string): string {
    var val = value;
    val = val.replace(/[^0-9\.]/g,'');

    if(val != "") {
      var valArr = val.split('.');
      valArr[0] = (parseFloat(valArr[0])).toLocaleString();
      val = valArr.join('.');
    }

    return val;
  }
  static formatWithCommasReport(value: string): string {
    var val = value;
    val = val.replace(/[^0-9\.]/g,'');

    if(val != "") {
      var valArr = val.split('.');
      valArr[0] = (parseFloat(valArr[0])).toLocaleString();
      val = valArr.join('.');
    }

    return val;
  }
}
