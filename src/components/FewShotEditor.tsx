
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { preloadedShortcutData, preloadedSubclassData } from '@/data/fewShotExamples';
import { validateCsvColumns } from '@/utils/csvParser';
import { FewShotExamplesTable } from './FewShotExamplesTable';
import { FewShotFileUpload } from './FewShotFileUpload';

interface FewShotEditorProps {
  pattern: 'shortcut' | 'subclass';
}

export const FewShotEditor: React.FC<FewShotEditorProps> = ({ pattern }) => {
  const [csvData, setCsvData] = useState<any[]>([]);

  const requiredColumns = pattern === 'shortcut' 
    ? ['A_label', 'p_label', 'B_label', 'r_label', 'C_label', 'Property']
    : ['A_label', 'p_label', 'B_label', 'C_label', 'Subclass'];

  // Load preloaded data when pattern changes
  useEffect(() => {
    if (pattern === 'shortcut') {
      setCsvData(preloadedShortcutData);
    } else if (pattern === 'subclass') {
      setCsvData(preloadedSubclassData);
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
      const validation = validateCsvColumns(text, requiredColumns);
      
      if (!validation.isValid) {
        toast({
          title: "Invalid CSV Format",
          description: `${validation.message}. Please ensure your CSV has the following required columns: ${requiredColumns.join(', ')}`,
          variant: "destructive",
        });
        return;
      }
      
      setCsvData(validation.data);
      toast({
        title: "CSV Uploaded",
        description: `Loaded ${validation.data.length} examples for ${pattern} pattern`,
      });
    };
    reader.readAsText(file);
  };

  const isPreloaded = (pattern === 'shortcut' && csvData === preloadedShortcutData) || 
                     (pattern === 'subclass' && csvData === preloadedSubclassData);

  return (
    <Card className="border-amber-200 bg-amber-50/50">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-amber-800">
          <FileText className="h-5 w-5" />
          <span>Few-Shot Examples ({pattern})</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <FewShotFileUpload 
          onFileUpload={handleFileUpload}
          requiredColumns={requiredColumns}
        />
        
        <FewShotExamplesTable 
          csvData={csvData}
          requiredColumns={requiredColumns}
          isPreloaded={isPreloaded}
        />
      </CardContent>
    </Card>
  );
};
