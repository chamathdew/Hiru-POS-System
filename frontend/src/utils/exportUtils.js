import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

export const exportToPDF = (title, columns, data, fileName = 'report.pdf') => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text(title, 14, 22);
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);

    const tableColumn = columns.map(col => col.header);
    const tableRows = data.map(item => columns.map(col => {
        if (col.key.includes('.')) {
            const keys = col.key.split('.');
            let val = item;
            keys.forEach(k => val = val?.[k]);
            return val;
        }
        return item[col.key];
    }));

    doc.autoTable({
        head: [tableColumn],
        body: tableRows,
        startY: 35,
        theme: 'grid',
        headStyles: { fillColor: [247, 147, 26], textColor: 255 }, // Hiru Orange
        alternateRowStyles: { fillColor: [245, 245, 245] }
    });

    doc.save(fileName);
};

export const exportToExcel = (data, fileName = 'report.xlsx') => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
    XLSX.writeFile(workbook, fileName);
};
