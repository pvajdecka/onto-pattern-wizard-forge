
export interface CsvValidationResult {
  isValid: boolean;
  data: any[];
  missingColumns: string[];
  message?: string;
}

export const parseCsvData = (text: string): any[] => {
  const lines = text.split('\n');
  const headers = lines[0].split(',');
  const data = lines.slice(1).map(line => {
    const values = line.split(',');
    return headers.reduce((obj, header, index) => {
      obj[header.trim()] = values[index]?.trim() || '';
      return obj;
    }, {} as any);
  });
  
  return data.filter(row => Object.values(row).some(val => val !== ''));
};

export const validateCsvColumns = (text: string, requiredColumns: string[]): CsvValidationResult => {
  const lines = text.split('\n');
  if (lines.length === 0) {
    return {
      isValid: false,
      data: [],
      missingColumns: requiredColumns,
      message: 'CSV file is empty'
    };
  }

  const headers = lines[0].split(',').map(h => h.trim());
  const missingColumns = requiredColumns.filter(col => !headers.includes(col));
  
  if (missingColumns.length > 0) {
    return {
      isValid: false,
      data: [],
      missingColumns,
      message: `Missing required columns: ${missingColumns.join(', ')}`
    };
  }

  const data = parseCsvData(text);
  return {
    isValid: true,
    data,
    missingColumns: [],
    message: 'CSV format is valid'
  };
};
