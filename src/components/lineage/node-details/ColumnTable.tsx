
import React from 'react';
import { Column } from '@/types/lineage';
import { Separator } from '@/components/ui/separator';

interface ColumnTableProps {
  columns: Column[];
}

const ColumnTable: React.FC<ColumnTableProps> = ({ columns }) => {
  if (!columns || columns.length === 0) return null;

  return (
    <div>
      <Separator className="my-4" />
      <h4 className="text-sm font-medium mb-2">Structure ({columns.length} columns)</h4>
      <div className="rounded-md border">
        <table className="w-full">
          <thead>
            <tr className="text-left text-xs font-medium text-muted-foreground border-b border-border">
              <th className="p-2">Name</th>
              <th className="p-2">Type</th>
            </tr>
          </thead>
          <tbody>
            {columns.map((column: Column) => (
              <tr key={column.name} className="text-sm border-b border-border last:border-0">
                <td className="p-2 font-medium">{column.name}</td>
                <td className="p-2 text-muted-foreground">{column.type}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ColumnTable;
