import { Injectable } from '@angular/core';
import * as fs from 'file-saver';
import * as ExcelJS from 'exceljs/dist/exceljs.min.js';

@Injectable({
  providedIn: 'root'
})
export class ExportToExcelService {

  constructor() { }

  async export2Excel(exportHdr: string[], workSheetname: string, data: any[], fileName: string) {
    // Create workbook and worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(workSheetname);
    const headerRow = worksheet.addRow(exportHdr);
    // Cell Style : Fill and Border

   // worksheet.addRow(['Date : ' + this._datePipe.transform(new Date(), 'medium')]);

    headerRow.eachCell((cell) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'b3c6ff' },
        bgColor: { argb: 'FF0000FF' }
      };
      cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
    });

    worksheet.addRows(data);

    // Generate Excel File with given name

    // tslint:disable-next-line: no-shadowed-variable
    workbook.xlsx.writeBuffer().then((data: any) => {
      const blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
      fs.saveAs(blob, fileName + '.xlsx');
    });
  }

}
