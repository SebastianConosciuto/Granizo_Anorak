import React, { useMemo, forwardRef } from 'react';
import { Box, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
} from '@tanstack/react-table';

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

const TableCell = styled('td')(({ isDateCell, isCold, isHighlighted }) => ({
  fontFamily: "'Poppins', sans-serif",
  fontSize: '0.875rem',
  fontWeight: isDateCell ? 600 : 400,
  color: isCold ? '#3b82f6' : '#263238',
  backgroundColor: isHighlighted 
    ? '#fef3c7' 
    : isCold 
      ? '#eff6ff' 
      : 'transparent',
  padding: '0.625rem 0.75rem',
  textAlign: isDateCell ? 'left' : 'center',
  borderRight: isDateCell ? '1px solid #e5e7eb' : 'none',
  transition: 'background-color 0.2s ease',
}));

const columnHelper = createColumnHelper();

const TemperatureTable = forwardRef(({ data, selectedDate, selectedPointTime }, ref) => {
  if (!data || !data.data) return null;

  const tableData = useMemo(() => {
    if (!selectedPointTime) return [];

    const selectedIndex = data.data.findIndex(item => item.time === selectedPointTime);
    if (selectedIndex === -1) return [];

    const next4Hours = data.data.slice(selectedIndex, selectedIndex + 16);
    
    if (next4Hours.length === 0) return [];

    const rows = [];
    for (let i = 0; i < 17; i += 4) {
      const hourData = next4Hours.slice(i, i + 4);
      if (hourData.length === 0) continue;

      const firstPoint = new Date(hourData[0].time);
      const row = {
        time: firstPoint.toLocaleString('es-AR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
        isStartPoint: i === 0,
      };

      for (let idx = 0; idx < 4; idx++) {
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
        cell: (info) => {
          const point = info.getValue();
          return point ? `${point.value.toFixed(1)}°C` : '-';
        },
      }),
      columnHelper.accessor('point1', {
        header: '+15 min',
        cell: (info) => {
          const point = info.getValue();
          return point ? `${point.value.toFixed(1)}°C` : '-';
        },
      }),
      columnHelper.accessor('point2', {
        header: '+30 min',
        cell: (info) => {
          const point = info.getValue();
          return point ? `${point.value.toFixed(1)}°C` : '-';
        },
      }),
      columnHelper.accessor('point3', {
        header: '+45 min',
        cell: (info) => {
          const point = info.getValue();
          return point ? `${point.value.toFixed(1)}°C` : '-';
        },
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
        <TableTitle>Tabla de valores (intervalos de 15 minutos)</TableTitle>
        <TableSubtitle>
          Próximos 4 horas desde el punto seleccionado
        </TableSubtitle>
        {!selectedPointTime && (
          <InfoText>
            Seleccione un punto en la gráfica para ver los datos
          </InfoText>
        )}
        {selectedPointTime && (
          <InfoText>
            Mostrando datos desde: {new Date(selectedPointTime).toLocaleString('es-AR', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
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
                  const isCold = !isDateCell && point && typeof point.value === 'number' && point.value < 0;
                  const isHighlighted = row.original.isStartPoint && index === 0;
                  
                  return (
                    <TableCell 
                      key={cell.id} 
                      isDateCell={isDateCell}
                      isCold={isCold}
                      isHighlighted={isHighlighted}
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