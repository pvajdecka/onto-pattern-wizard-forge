
import React from 'react';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';

interface FewShotFileUploadProps {
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  requiredColumns: string[];
}

export const FewShotFileUpload: React.FC<FewShotFileUploadProps> = ({
  onFileUpload,
  requiredColumns
}) => {
  return (
    <div className="flex items-center space-x-4">
      <input
        type="file"
        accept=".csv"
        onChange={onFileUpload}
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
  );
};
