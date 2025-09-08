'use client';

import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Typography
} from '@mui/material';
import { type MRT_ColumnDef } from 'material-react-table';

interface DataTableProps {
  columns: MRT_ColumnDef<any>[];
  data: any[];
  loading?: boolean;
  enableRowActions?: boolean;
  renderRowActions?: (params: { row: any }) => React.ReactNode;
  onRowClick?: (row: any) => void;
}

/**
 * 簡單的 DataTable 組件，用於替代 material-react-table
 */
function DataTable({ 
  columns, 
  data, 
  loading = false, 
  enableRowActions = false, 
  renderRowActions,
  onRowClick 
}: DataTableProps) {
  if (loading) {
    return (
      <Paper className="p-8 text-center">
        <CircularProgress />
        <Typography className="mt-4">載入中...</Typography>
      </Paper>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Paper className="p-8 text-center">
        <Typography color="text.secondary">暫無資料</Typography>
      </Paper>
    );
  }

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            {columns.map((column, index) => (
              <TableCell key={index} className="font-bold">
                {typeof column.header === 'string' ? column.header : column.accessorKey}
              </TableCell>
            ))}
            {enableRowActions && <TableCell>操作</TableCell>}
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((row, rowIndex) => (
            <TableRow 
              key={rowIndex} 
              hover
              onClick={() => onRowClick?.(row)}
              className={onRowClick ? "cursor-pointer" : ""}
            >
              {columns.map((column, colIndex) => {
                const value = column.accessorKey ? row[column.accessorKey] : '';
                return (
                  <TableCell key={colIndex}>
                    {column.Cell ? column.Cell({ cell: { getValue: () => value }, row: { original: row } }) : value}
                  </TableCell>
                );
              })}
              {enableRowActions && renderRowActions && (
                <TableCell>
                  {renderRowActions({ row })}
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default DataTable;