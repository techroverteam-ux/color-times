import Papa from "papaparse";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import ExcelJS from "exceljs";

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function downloadCsv(
  filename: string,
  headers: string[],
  rows: (string | number)[][]
): void {
  const csv = Papa.unparse({ fields: headers, data: rows });
  downloadBlob(new Blob([csv], { type: "text/csv;charset=utf-8;" }), `${filename}.csv`);
}

export function downloadPdf(
  filename: string,
  title: string,
  headers: string[],
  rows: (string | number)[][]
): void {
  const doc = new jsPDF({ orientation: rows.length && headers.length > 6 ? "landscape" : "portrait" });
  doc.setFontSize(14);
  doc.text(title, 14, 15);
  doc.setFontSize(9);
  doc.text(new Date().toLocaleString("en-IN"), 14, 21);

  autoTable(doc, {
    head: [headers],
    body: rows.map((row) => row.map((cell) => String(cell))),
    startY: 26,
    styles: { fontSize: 8 },
    headStyles: { fillColor: [32, 26, 22] },
  });

  doc.save(`${filename}.pdf`);
}

const BRAND_WINE = "FF6D1238";
const BORDER_GRAY = "FFE5E7EB";
const ALT_ROW_FILL = "FFF9F6F2";

export async function downloadExcel(
  filename: string,
  title: string,
  headers: string[],
  rows: (string | number)[][]
): Promise<void> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Color Times Boutique";
  workbook.created = new Date();

  const sheet = workbook.addWorksheet((title || "Report").slice(0, 31));

  sheet.mergeCells(1, 1, 1, Math.max(headers.length, 1));
  const titleCell = sheet.getRow(1).getCell(1);
  titleCell.value = title;
  titleCell.font = { bold: true, size: 14, color: { argb: BRAND_WINE } };
  sheet.getRow(1).height = 24;

  sheet.mergeCells(2, 1, 2, Math.max(headers.length, 1));
  const subtitleCell = sheet.getRow(2).getCell(1);
  subtitleCell.value = `Generated ${new Date().toLocaleString("en-IN")}`;
  subtitleCell.font = { italic: true, size: 9, color: { argb: "FF6B7280" } };

  const headerRowIndex = 4;
  const headerRow = sheet.getRow(headerRowIndex);
  headers.forEach((header, index) => {
    const cell = headerRow.getCell(index + 1);
    cell.value = header;
    cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: BRAND_WINE } };
    cell.alignment = { vertical: "middle" };
    cell.border = {
      top: { style: "thin", color: { argb: BORDER_GRAY } },
      bottom: { style: "thin", color: { argb: BORDER_GRAY } },
      left: { style: "thin", color: { argb: BORDER_GRAY } },
      right: { style: "thin", color: { argb: BORDER_GRAY } },
    };
  });
  headerRow.height = 20;

  rows.forEach((row, rowIndex) => {
    const excelRow = sheet.getRow(headerRowIndex + 1 + rowIndex);
    row.forEach((value, colIndex) => {
      const cell = excelRow.getCell(colIndex + 1);
      cell.value = value;
      cell.border = { bottom: { style: "thin", color: { argb: BORDER_GRAY } } };
      if (rowIndex % 2 === 1) {
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: ALT_ROW_FILL } };
      }
    });
  });

  headers.forEach((header, index) => {
    const longestValue = rows.reduce(
      (max, row) => Math.max(max, String(row[index] ?? "").length),
      header.length
    );
    sheet.getColumn(index + 1).width = Math.min(Math.max(longestValue + 2, 10), 40);
  });

  const buffer = await workbook.xlsx.writeBuffer();
  downloadBlob(
    new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    }),
    `${filename}.xlsx`
  );
}

export function parseCsvFile<T = Record<string, string>>(file: File): Promise<T[]> {
  return new Promise((resolve, reject) => {
    Papa.parse<T>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => resolve(results.data),
      error: (error: Error) => reject(error),
    });
  });
}

export async function parseXlsxFile<T = Record<string, string>>(file: File): Promise<T[]> {
  const workbook = new ExcelJS.Workbook();
  const buffer = await file.arrayBuffer();
  await workbook.xlsx.load(buffer);

  const sheet = workbook.worksheets[0];
  if (!sheet) return [];

  const headerRow = sheet.getRow(1);
  const headers: string[] = [];
  headerRow.eachCell({ includeEmpty: false }, (cell, colNumber) => {
    headers[colNumber] = String(cell.value ?? "").trim();
  });

  const rows: T[] = [];
  sheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;
    const record: Record<string, string> = {};
    row.eachCell({ includeEmpty: false }, (cell, colNumber) => {
      const header = headers[colNumber];
      if (!header) return;
      const value = cell.value;
      record[header] =
        value === null || value === undefined
          ? ""
          : typeof value === "object" && "text" in value
            ? String((value as { text: string }).text)
            : String(value);
    });
    if (Object.values(record).some((value) => value !== "")) {
      rows.push(record as T);
    }
  });

  return rows;
}

export function parseSpreadsheetFile<T = Record<string, string>>(file: File): Promise<T[]> {
  const isXlsx =
    file.name.toLowerCase().endsWith(".xlsx") ||
    file.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
  return isXlsx ? parseXlsxFile<T>(file) : parseCsvFile<T>(file);
}
