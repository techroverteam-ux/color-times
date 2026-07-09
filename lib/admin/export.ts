import Papa from "papaparse";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

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
