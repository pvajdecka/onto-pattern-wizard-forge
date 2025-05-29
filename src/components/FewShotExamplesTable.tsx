
import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface FewShotExamplesTableProps {
  csvData: any[];
  requiredColumns: string[];
  isPreloaded: boolean;
}

export const FewShotExamplesTable: React.FC<FewShotExamplesTableProps> = ({
  csvData,
  requiredColumns,
  isPreloaded
}) => {
  if (csvData.length === 0) return null;

  return (
    <div className="mt-4">
      <p className="text-sm font-medium text-amber-700 mb-2">
        Currently {csvData.length} few-shot examples loaded
        {isPreloaded && ' (preloaded)'}
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
  );
};
