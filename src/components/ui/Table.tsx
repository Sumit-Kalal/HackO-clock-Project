import React from 'react';
import { cn } from '../../lib/utils';

interface TableProps extends React.TableHTMLAttributes<HTMLTableElement> {
  headers: string[];
  children?: React.ReactNode;
  className?: string;
}

export function Table({ headers, children, className, ...props }: TableProps) {
  return (
    <div className="overflow-x-auto rounded-lg border border-gray-800 bg-[#111827]">
      <table className={cn("w-full text-left text-sm", className)} {...props}>
        <thead className="bg-[#1F2937] text-gray-400 font-medium uppercase text-xs tracking-wider border-b border-gray-800">
          <tr>
            {headers.map((header) => (
              <th key={header} className="px-6 py-4">{header}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-800 text-gray-300">
          {children}
        </tbody>
      </table>
    </div>
  );
}
