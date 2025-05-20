
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Payment, Expense } from '@/data/types';
import { formatDate, formatCurrency } from './financialUtils';

export const exportPaymentsToExcel = (payments: Payment[], fileName = 'payments.xlsx') => {
  const worksheet = XLSX.utils.json_to_sheet(
    payments.map(p => ({
      Date: formatDate(p.date),
      Description: p.description,
      Amount: p.amount,
      Status: p.status,
      Project: p.projectId,
    }))
  );

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Payments');
  
  // Generate Excel file
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  saveExcelFile(excelBuffer, fileName);
};

export const exportExpensesToExcel = (expenses: Expense[], fileName = 'expenses.xlsx') => {
  const worksheet = XLSX.utils.json_to_sheet(
    expenses.map(e => ({
      Date: formatDate(e.date),
      Description: e.description,
      Amount: e.amount,
      Category: e.category,
      Project: e.projectId,
    }))
  );

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Expenses');
  
  // Generate Excel file
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  saveExcelFile(excelBuffer, fileName);
};

const saveExcelFile = (buffer: ArrayBuffer, fileName: string) => {
  const data = new Blob([buffer], { type: 'application/octet-stream' });
  saveAs(data, fileName);
};

export const exportPaymentsToPDF = (payments: Payment[], fileName = 'payments.pdf') => {
  const doc = new jsPDF();
  
  doc.setFontSize(18);
  doc.text('Payments Report', 14, 22);
  doc.setFontSize(11);
  doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);
  
  const tableColumn = ["Date", "Description", "Amount", "Status", "Project ID"];
  const tableRows = payments.map(payment => [
    formatDate(payment.date),
    payment.description,
    formatCurrency(payment.amount),
    payment.status,
    payment.projectId
  ]);
  
  autoTable(doc, {
    head: [tableColumn],
    body: tableRows,
    startY: 40
  });
  
  doc.save(fileName);
};

export const exportExpensesToPDF = (expenses: Expense[], fileName = 'expenses.pdf') => {
  const doc = new jsPDF();
  
  doc.setFontSize(18);
  doc.text('Expenses Report', 14, 22);
  doc.setFontSize(11);
  doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);
  
  const tableColumn = ["Date", "Description", "Amount", "Category", "Project ID"];
  const tableRows = expenses.map(expense => [
    formatDate(expense.date),
    expense.description,
    formatCurrency(expense.amount),
    expense.category,
    expense.projectId
  ]);
  
  autoTable(doc, {
    head: [tableColumn],
    body: tableRows,
    startY: 40
  });
  
  doc.save(fileName);
};
