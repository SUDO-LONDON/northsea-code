import { Product } from './products';

// Unit mapping for different products
const GASOIL_NAMES = [
  "M0 SG 10PPM FP",
  "M0 0.1% BGS"
];

const BBLS_PRODUCTS = ["USGC 3%", "USGC 0.5%", "Singapore 10ppm"];

const getUnit = (name: string) => {
  if (name === "Rotterdam 0.1%") return " / MT";
  if (BBLS_PRODUCTS.includes(name)) return " / BBLS";
  return GASOIL_NAMES.includes(name) ? " / BBLS" : " / MT";
};

// Convert array of objects to CSV string
export function convertToCSV(data: Product[]): string {
  if (data.length === 0) return '';

  // CSV headers
  const headers = [
    'Product',
    'HFO Price',
    'VLSFO Price', 
    'MGO Price',
    'Change (%)',
    'Last Updated'
  ];

  // Convert data to CSV rows
  const rows = data.map(product => {
    const unit = getUnit(product.name);
    return [
      `"${product.name}${unit}"`,
      `$${product.hfo.toFixed(2)}`,
      `$${product.vlsfo.toFixed(2)}`,
      `$${product.mgo.toFixed(2)}`,
      `${product.change >= 0 ? '+' : ''}${product.change.toFixed(2)}%`,
      `"${new Date(product.lastupdated).toLocaleString()}"`
    ];
  });

  // Combine headers and rows
  const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
  
  return csvContent;
}

// Download CSV file
export function downloadCSV(data: Product[], filename: string = 'bunker_prices'): void {
  const csvContent = convertToCSV(data);
  
  if (!csvContent) {
    console.warn('No data to export');
    return;
  }

  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
  
  // Append to body, click, and remove
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Clean up the URL object
  URL.revokeObjectURL(url);
}

// Export to Excel format (basic CSV with .xlsx extension for Excel compatibility)
export function downloadExcel(data: Product[], filename: string = 'bunker_prices'): void {
  const csvContent = convertToCSV(data);
  
  if (!csvContent) {
    console.warn('No data to export');
    return;
  }

  // Create blob for Excel (CSV format that Excel can open)
  const blob = new Blob([csvContent], { type: 'application/vnd.ms-excel;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}