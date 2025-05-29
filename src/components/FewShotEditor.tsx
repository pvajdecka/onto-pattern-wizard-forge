
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, FileText } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface FewShotEditorProps {
  pattern: 'shortcut' | 'subclass';
}

export const FewShotEditor: React.FC<FewShotEditorProps> = ({ pattern }) => {
  const [csvData, setCsvData] = useState<any[]>([]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      // Simple CSV parsing - in real app, use a proper CSV parser
      const lines = text.split('\n');
      const headers = lines[0].split(',');
      const data = lines.slice(1).map(line => {
        const values = line.split(',');
        return headers.reduce((obj, header, index) => {
          obj[header.trim()] = values[index]?.trim() || '';
          return obj;
        }, {} as any);
      });
      
      setCsvData(data.filter(row => Object.values(row).some(val => val !== '')));
      toast({
        title: "CSV Uploaded",
        description: `Loaded ${data.length} examples for ${pattern} pattern`,
      });
    };
    reader.readAsText(file);
  };

  const requiredColumns = pattern === 'shortcut' 
    ? ['A_label', 'p_label', 'B_label', 'r_label', 'C_label', 'Property']
    : ['A_label', 'p_label', 'B_label', 'C_label', 'Subclass'];

  return (
    <Card className="border-amber-200 bg-amber-50/50">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-amber-800">
          <FileText className="h-5 w-5" />
          <span>Few-Shot Examples ({pattern})</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-4">
          <input
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            className="hidden"
            id="csv-upload"
          />
          <label htmlFor="csv-upload">
            <Button variant="outline" className="cursor-pointer" asChild>
              <span className="flex items-center space-x-2">
                <Upload className="h-4 w-4" />
                <span>Upload CSV</span>
              </span>
            </Button>
          </label>
          <span className="text-sm text-gray-600">
            Required columns: {requiredColumns.join(', ')}
          </span>
        </div>

        {csvData.length > 0 && (
          <div className="mt-4">
            <p className="text-sm font-medium text-amber-700 mb-2">
              Currently {csvData.length} few-shot examples loaded
            </p>
            <div className="max-h-32 overflow-y-auto bg-white rounded border border-amber-200">
              <table className="w-full text-xs">
                <thead className="bg-amber-100">
                  <tr>
                    {requiredColumns.map(col => (
                      <th key={col} className="p-2 text-left font-medium text-amber-800">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {csvData.slice(0, 3).map((row, index) => (
                    <tr key={index} className="border-t border-amber-200">
                      {requiredColumns.map(col => (
                        <td key={col} className="p-2 text-gray-700">
                          {row[col] || '-'}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {csvData.length > 3 && (
              <p className="text-xs text-gray-500 mt-1">
                Showing first 3 of {csvData.length} examples
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
