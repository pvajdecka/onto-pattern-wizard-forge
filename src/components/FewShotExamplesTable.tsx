
import React, { useState, useCallback, useMemo } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Edit, Trash2, Check, X } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface FewShotExamplesTableProps {
  csvData: any[];
  requiredColumns: string[];
  isPreloaded: boolean;
  onDataChange: (newData: any[]) => void;
}

export const FewShotExamplesTable: React.FC<FewShotExamplesTableProps> = ({
  csvData,
  requiredColumns,
  isPreloaded,
  onDataChange
}) => {
  const [editingRowIndex, setEditingRowIndex] = useState<number | null>(null);
  const [editingData, setEditingData] = useState<any>({});
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newRowData, setNewRowData] = useState<any>({});

  const startEdit = useCallback((index: number) => {
    setEditingRowIndex(index);
    setEditingData({ ...csvData[index] });
  }, [csvData]);

  const cancelEdit = useCallback(() => {
    setEditingRowIndex(null);
    setEditingData({});
  }, []);

  const saveEdit = useCallback(() => {
    if (editingRowIndex !== null) {
      const newData = [...csvData];
      newData[editingRowIndex] = editingData;
      onDataChange(newData);
      setEditingRowIndex(null);
      setEditingData({});
      toast({
        title: "Row Updated",
        description: "The few-shot example has been updated successfully.",
      });
    }
  }, [editingRowIndex, csvData, editingData, onDataChange]);

  const deleteRow = useCallback((index: number) => {
    const newData = csvData.filter((_, i) => i !== index);
    onDataChange(newData);
    toast({
      title: "Row Deleted",
      description: "The few-shot example has been deleted successfully.",
    });
  }, [csvData, onDataChange]);

  const startAddNew = useCallback(() => {
    setIsAddingNew(true);
    const emptyRow = requiredColumns.reduce((obj, col) => {
      obj[col] = '';
      return obj;
    }, {} as any);
    setNewRowData(emptyRow);
  }, [requiredColumns]);

  const cancelAddNew = useCallback(() => {
    setIsAddingNew(false);
    setNewRowData({});
  }, []);

  const saveNewRow = useCallback(() => {
    // Check if all required fields are filled
    const hasEmptyFields = requiredColumns.some(col => !newRowData[col]?.trim());
    if (hasEmptyFields) {
      toast({
        title: "Incomplete Data",
        description: "Please fill in all required columns.",
        variant: "destructive",
      });
      return;
    }

    const newData = [...csvData, newRowData];
    onDataChange(newData);
    setIsAddingNew(false);
    setNewRowData({});
    toast({
      title: "Row Added",
      description: "New few-shot example has been added successfully.",
    });
  }, [requiredColumns, newRowData, csvData, onDataChange]);

  const handleEditingDataChange = useCallback((col: string, value: string) => {
    setEditingData(prev => ({
      ...prev,
      [col]: value
    }));
  }, []);

  const handleNewRowDataChange = useCallback((col: string, value: string) => {
    setNewRowData(prev => ({
      ...prev,
      [col]: value
    }));
  }, []);

  // Memoize the table rows to prevent unnecessary re-renders
  const tableRows = useMemo(() => {
    return csvData.map((row, index) => (
      <TableRow key={`${index}-${JSON.stringify(row)}`} className="border-amber-200 hover:bg-amber-50/50">
        {requiredColumns.map(col => (
          <TableCell key={col} className="text-gray-700 p-2">
            {editingRowIndex === index ? (
              <Input
                value={editingData[col] || ''}
                onChange={(e) => handleEditingDataChange(col, e.target.value)}
                className="h-8 text-xs border-amber-300 focus:border-amber-500"
              />
            ) : (
              <span className="text-xs">{row[col] || '-'}</span>
            )}
          </TableCell>
        ))}
        <TableCell className="p-2">
          {editingRowIndex === index ? (
            <div className="flex space-x-1">
              <Button
                onClick={saveEdit}
                size="sm"
                className="h-7 w-7 p-0 bg-green-600 hover:bg-green-700"
              >
                <Check className="h-3 w-3" />
              </Button>
              <Button
                onClick={cancelEdit}
                size="sm"
                variant="outline"
                className="h-7 w-7 p-0 border-gray-300"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ) : (
            <div className="flex space-x-1">
              <Button
                onClick={() => startEdit(index)}
                size="sm"
                variant="outline"
                className="h-7 w-7 p-0 border-amber-300 hover:bg-amber-50"
              >
                <Edit className="h-3 w-3" />
              </Button>
              <Button
                onClick={() => deleteRow(index)}
                size="sm"
                variant="outline"
                className="h-7 w-7 p-0 border-red-300 hover:bg-red-50 text-red-600"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          )}
        </TableCell>
      </TableRow>
    ));
  }, [csvData, requiredColumns, editingRowIndex, editingData, startEdit, deleteRow, saveEdit, cancelEdit, handleEditingDataChange]);

  if (csvData.length === 0 && !isAddingNew) {
    return (
      <div className="mt-4 text-center py-8">
        <p className="text-sm text-gray-500 mb-4">No few-shot examples loaded</p>
        <Button onClick={startAddNew} className="bg-amber-600 hover:bg-amber-700 text-white">
          <Plus className="h-4 w-4 mr-2" />
          Add First Example
        </Button>
      </div>
    );
  }

  return (
    <div className="mt-4 space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-amber-700">
          Currently {csvData.length} few-shot examples loaded
          {isPreloaded && ' (preloaded)'}
        </p>
        <Button 
          onClick={startAddNew} 
          disabled={isAddingNew}
          className="bg-amber-600 hover:bg-amber-700 text-white"
          size="sm"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Example
        </Button>
      </div>

      <ScrollArea className="h-80 bg-white rounded-lg border border-amber-200 shadow-sm">
        <Table>
          <TableHeader className="bg-amber-100 sticky top-0">
            <TableRow>
              {requiredColumns.map(col => (
                <TableHead key={col} className="font-medium text-amber-800 min-w-[120px]">
                  {col}
                </TableHead>
              ))}
              <TableHead className="font-medium text-amber-800 w-24">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tableRows}
            
            {isAddingNew && (
              <TableRow className="border-amber-200 bg-blue-50/50">
                {requiredColumns.map(col => (
                  <TableCell key={col} className="p-2">
                    <Input
                      value={newRowData[col] || ''}
                      onChange={(e) => handleNewRowDataChange(col, e.target.value)}
                      placeholder={`Enter ${col}`}
                      className="h-8 text-xs border-blue-300 focus:border-blue-500"
                    />
                  </TableCell>
                ))}
                <TableCell className="p-2">
                  <div className="flex space-x-1">
                    <Button
                      onClick={saveNewRow}
                      size="sm"
                      className="h-7 w-7 p-0 bg-blue-600 hover:bg-blue-700"
                    >
                      <Check className="h-3 w-3" />
                    </Button>
                    <Button
                      onClick={cancelAddNew}
                      size="sm"
                      variant="outline"
                      className="h-7 w-7 p-0 border-gray-300"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </ScrollArea>
    </div>
  );
};
