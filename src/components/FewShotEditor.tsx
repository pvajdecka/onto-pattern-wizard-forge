import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Upload, FileText } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface FewShotEditorProps {
  pattern: 'shortcut' | 'subclass';
}

export const FewShotEditor: React.FC<FewShotEditorProps> = ({ pattern }) => {
  const [csvData, setCsvData] = useState<any[]>([]);

  // Preloaded data for shortcut pattern
  const preloadedShortcutData = [
    {
      A_label: 'Emission Conversion Factor',
      p_label: 'has applicable period',
      B_label: 'Temporal entity',
      r_label: 'has beginning',
      C_label: 'Time instant',
      Property: 'Applicable Period Start'
    },
    {
      A_label: 'Emission Conversion Factor',
      p_label: 'has applicable period',
      B_label: 'Temporal entity',
      r_label: 'has beginning',
      C_label: 'Time instant',
      Property: 'Applicable From Time'
    },
    {
      A_label: 'Emission Conversion Factor',
      p_label: 'has applicable period',
      B_label: 'Temporal entity',
      r_label: 'has end',
      C_label: 'Time instant',
      Property: 'Applicable Period End'
    },
    {
      A_label: 'Emission Conversion Factor',
      p_label: 'has applicable period',
      B_label: 'Temporal entity',
      r_label: 'has end',
      C_label: 'Time instant',
      Property: 'Applicable Until Time'
    },
    {
      A_label: 'Collaboration Concept',
      p_label: 'uses component',
      B_label: 'Component Module',
      r_label: 'includes functional component',
      C_label: 'Functional Module',
      Property: "Component's Functional Module"
    },
    {
      A_label: 'Collaboration Concept',
      p_label: 'uses component',
      B_label: 'Component Module',
      r_label: 'includes functional component',
      C_label: 'Functional Module',
      Property: 'Composed Of Functional Module'
    },
    {
      A_label: 'AccessConditionSet',
      p_label: 'hasVariable',
      B_label: 'Variable',
      r_label: 'hasValue',
      C_label: 'Value',
      Property: "Variable's Value"
    },
    {
      A_label: 'AccessConditionSet',
      p_label: 'hasVariable',
      B_label: 'Variable',
      r_label: 'hasValue',
      C_label: 'Value',
      Property: 'Defines Variable Value'
    },
    {
      A_label: 'SLA Class',
      p_label: 'SLA Contains',
      B_label: 'Term of the agreement',
      r_label: 'Term Compensation',
      C_label: 'Conditions of compensation',
      Property: 'Defines Compensation Terms'
    },
    {
      A_label: 'SLA Class',
      p_label: 'SLA Contains',
      B_label: 'Term of the agreement',
      r_label: 'Include Defs',
      C_label: 'Definitions of the agreement',
      Property: 'includes agreement definitions'
    },
    {
      A_label: 'Space',
      p_label: 'has usergroup',
      B_label: 'Usergroup',
      r_label: 'has member',
      C_label: 'User Account',
      Property: 'User Associated with Usergroup'
    },
    {
      A_label: 'Group of Tables',
      p_label: 'table',
      B_label: 'Annotated Table',
      r_label: 'row',
      C_label: 'Row',
      Property: 'Annotated Table Row'
    },
    {
      A_label: 'Occurrence',
      p_label: 'is detected by',
      B_label: 'Device',
      r_label: 'has interface',
      C_label: 'Interface',
      Property: 'Detected Through Device Interface'
    },
    {
      A_label: 'Organization',
      p_label: 'delivery location',
      B_label: 'Residence Object',
      r_label: 'addres',
      C_label: 'BasicAddress',
      Property: 'Has Delivery Address'
    }
  ];

  // Load preloaded data when pattern changes
  useEffect(() => {
    if (pattern === 'shortcut') {
      setCsvData(preloadedShortcutData);
    } else {
      setCsvData([]);
    }
  }, [pattern]);

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
              {pattern === 'shortcut' && csvData === preloadedShortcutData && ' (preloaded)'}
            </p>
            <ScrollArea className="h-64 bg-white rounded border border-amber-200">
              <Table>
                <TableHeader className="bg-amber-100">
                  <TableRow>
                    {requiredColumns.map(col => (
                      <TableHead key={col} className="font-medium text-amber-800">
                        {col}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {csvData.map((row, index) => (
                    <TableRow key={index} className="border-amber-200">
                      {requiredColumns.map(col => (
                        <TableCell key={col} className="text-gray-700">
                          {row[col] || '-'}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
