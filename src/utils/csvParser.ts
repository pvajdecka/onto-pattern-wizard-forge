
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
