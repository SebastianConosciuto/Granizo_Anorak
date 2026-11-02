import React, { useMemo, forwardRef } from 'react';
import { Box, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
} from '@tanstack/react-table';
import { formatDateTime } from '../../../utils/timezone';

const TableContainer = styled(Box)({
  backgroundColor: '#ffffff',
  borderRadius: '16px',
  padding: '1rem',
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
  overflowX: 'auto',
});

const TableHeader = styled(Box)({
  marginBottom: '1rem',
});

const TableTitle = styled(Typography)({
  fontFamily: "'Poppins', sans-serif",
  fontSize: '1.125rem',
  fontWeight: 600,
  color: '#263238',
  marginBottom: '0.25rem',
});

const TableSubtitle = styled(Typography)({
  fontFamily: "'Poppins', sans-serif",
  fontSize: '0.8125rem',
  fontWeight: 400,
  color: '#6b7280',
});

const InfoText = styled(Typography)({
  fontFamily: "'Poppins', sans-serif",
  fontSize: '0.75rem',
  fontWeight: 400,
  color: '#1A8F89',
  marginTop: '0.5rem',
});

const StyledTable = styled('table')({
  width: '100%',
  borderCollapse: 'separate',
  borderSpacing: 0,
  minWidth: '600px',
});

const TableHead = styled('thead')({
  backgroundColor: '#1A8F89',
});

const TableRow = styled('tr')({
  '&:not(:last-child) td': {
    borderBottom: '1px solid #e5e7eb',
  },
  '&:hover td': {
    backgroundColor: '#f9fafb',
  },
});

const HeaderRow = styled('tr')({});

const TableHeaderCell = styled('th')({
  fontFamily: "'Poppins', sans-serif",
  fontSize: '0.875rem',
  fontWeight: 600,
  color: '#ffffff',
  padding: '0.75rem',
  textAlign: 'center',
  borderRight: '1px solid rgba(255, 255, 255, 0.2)',
  '&:first-of-type': {
    textAlign: 'left',
    borderTopLeftRadius: '8px',
  },
  '&:last-of-type': {
    borderRight: 'none',
    borderTopRightRadius: '8px',
  },
});

const TableCell = styled('td')(({ isDateCell, isCold, isHighlighted, isNoCloud, isHighRisk, isModerateRisk }) => ({
  fontFamily: "'Poppins', sans-serif",
  fontSize: '0.875rem',
  fontWeight: isDateCell ? 600 : 400,
  color: isNoCloud 
    ? '#0284c7' 
    : isHighRisk 
      ? '#dc2626' 
      : isModerateRisk 
        ? '#d97706' 
        : isCold 
          ? '#3b82f6' 
          : '#263238',
  backgroundColor: isHighlighted 
    ? '#fef3c7' 
    : isNoCloud
      ? '#e0f2fe'
      : isHighRisk
        ? '#fef2f2'
        : isModerateRisk
          ? '#fffbeb'
          : isCold 
            ? '#eff6ff' 
            : 'transparent',
  padding: '0.625rem 0.75rem',
  textAlign: isDateCell ? 'left' : 'center',
  borderRight: isDateCell ? '1px solid #e5e7eb' : 'none',
  transition: 'background-color 0.2s ease',
}));

const NoCloudBadge = styled(Box)({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '0.25rem',
  padding: '0.125rem 0.5rem',
  borderRadius: '4px',
  backgroundColor: '#bae6fd',
  border: '1px solid #7dd3fc',
  fontSize: '0.75rem',
  fontWeight: 500,
  color: '#0369a1',
});

const columnHelper = createColumnHelper();

// Helper function to render cell value
const renderCellValue = (point) => {
  if (!point) return '-';
  
  // Check if it's a null value (no clouds)
  if (point.value === null) {
    return (
      <NoCloudBadge>
        <span className="material-symbols-outlined" style={{ fontSize: '0.875rem' }}>
          cloud_off
        </span>
        Sin nubes
      </NoCloudBadge>
    );
  }
  
  return `${point.value.toFixed(1)}°C`;
};

const TemperatureTable = forwardRef(({ data, selectedDate, selectedPointTime }, ref) => {
  if (!data || !data.data) return null;

  // Field-local timezone resolved from the coordinates (e.g. UTC-3).
  const tz = data.timeZone;

  const tableData = useMemo(() => {
    if (!selectedPointTime) return [];

    const selectedIndex = data.data.findIndex(item => item.time === selectedPointTime);
    if (selectedIndex === -1) return [];

    // Get next 24 data points (4 hours at 10-minute intervals)
    const next4Hours = data.data.slice(selectedIndex, selectedIndex + 24);
    
    if (next4Hours.length === 0) return [];

    // Group into rows of 6 (1 hour each at 10-minute intervals)
    const rows = [];
    for (let i = 0; i < 24; i += 6) {
      const hourData = next4Hours.slice(i, i + 6);
      if (hourData.length === 0) continue;

      const row = {
        time: formatDateTime(hourData[0].time, tz),
        isStartPoint: i === 0,
      };

      for (let idx = 0; idx < 6; idx++) {
        if (hourData[idx]) {
          row[`point${idx}`] = {
            value: hourData[idx].value,
            time: hourData[idx].time,
          };
        } else {
          row[`point${idx}`] = null;
        }
      }

      rows.push(row);
    }

    return rows;
  }, [data, selectedPointTime]);

  const columns = useMemo(
    () => [
      columnHelper.accessor('time', {
        header: 'Hora Inicio',
        cell: (info) => {
          const row = info.row.original;
          return (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {row.isStartPoint && (
                <Box
                  sx={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: '#fbbf24',
                    border: '2px solid #f59e0b',
                  }}
                />
              )}
              <span>{info.getValue()}</span>
            </Box>
          );
        },
      }),
      columnHelper.accessor('point0', {
        header: '+0 min',
        cell: (info) => renderCellValue(info.getValue()),
      }),
      columnHelper.accessor('point1', {
        header: '+10 min',
        cell: (info) => renderCellValue(info.getValue()),
      }),
      columnHelper.accessor('point2', {
        header: '+20 min',
        cell: (info) => renderCellValue(info.getValue()),
      }),
      columnHelper.accessor('point3', {
        header: '+30 min',
        cell: (info) => renderCellValue(info.getValue()),
      }),
      columnHelper.accessor('point4', {
        header: '+40 min',
        cell: (info) => renderCellValue(info.getValue()),
      }),
      columnHelper.accessor('point5', {
        header: '+50 min',
        cell: (info) => renderCellValue(info.getValue()),
      }),
    ],
    []
  );

  const table = useReactTable({
    data: tableData,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <TableContainer ref={ref}>
      <TableHeader>
        <TableTitle>Tabla de valores (intervalos de 10 minutos)</TableTitle>
        <TableSubtitle>
          Próximas 4 horas desde el punto seleccionado
        </TableSubtitle>
        {!selectedPointTime && (
          <InfoText>
            Seleccione un punto en la gráfica para ver los datos
          </InfoText>
        )}
        {selectedPointTime && (
          <InfoText>
            Mostrando datos desde: {formatDateTime(selectedPointTime, tz)}
          </InfoText>
        )}
      </TableHeader>

      {tableData.length === 0 && selectedPointTime && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
            color: '#6b7280',
            fontSize: '0.875rem',
            fontFamily: "'Poppins', sans-serif",
          }}
        >
          No hay suficientes datos disponibles para mostrar las próximas 4 horas
        </Box>
      )}

      {tableData.length > 0 && (
        <StyledTable>
          <TableHead>
            <HeaderRow>
              {table.getHeaderGroups()[0].headers.map((header) => (
                <TableHeaderCell key={header.id}>
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext()
                  )}
                </TableHeaderCell>
              ))}
            </HeaderRow>
          </TableHead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell, index) => {
                  const isDateCell = index === 0;
                  const point = cell.getValue();
                  const isNoCloud = !isDateCell && point && point.value === null;
                  const temp = !isDateCell && point && typeof point.value === 'number' ? point.value : null;
                  const isCold = temp !== null && temp < 0;
                  const isHighRisk = temp !== null && temp <= -40;
                  const isModerateRisk = temp !== null && temp > -40 && temp <= -20;
                  const isHighlighted = row.original.isStartPoint && index === 0;
                  
                  return (
                    <TableCell 
                      key={cell.id} 
                      isDateCell={isDateCell}
                      isCold={isCold}
                      isHighlighted={isHighlighted}
                      isNoCloud={isNoCloud}
                      isHighRisk={isHighRisk}
                      isModerateRisk={isModerateRisk}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </tbody>
        </StyledTable>
      )}
    </TableContainer>
  );
});

TemperatureTable.displayName = 'TemperatureTable';

export default TemperatureTable;