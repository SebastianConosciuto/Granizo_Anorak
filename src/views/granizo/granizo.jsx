import React, { useState, useRef } from 'react';
import { Box } from '@mui/material';
import { styled } from '@mui/material/styles';
import Header from './components/Header';
import TemperatureChart from './components/TemperatureChart';
import TemperatureTable from './components/TemperatureTable';
import { exportToPDF } from '../../utils/exportUtils';

const ViewContainer = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  minHeight: '100vh',
  backgroundColor: '#E8EDF2',
  fontFamily: "'Poppins', sans-serif",
});

const ContentArea = styled(Box)(({ theme }) => ({
  flex: 1,
  padding: '1.5rem',
  display: 'flex',
  flexDirection: 'column',
  gap: '1rem',
  overflow: 'visible',
  minWidth: 0,

  [theme.breakpoints.down('md')]: {
    padding: '1rem',
    gap: '0.75rem',
  },
}));

function GranizoView() {
  const [temperatureData, setTemperatureData] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedPointTime, setSelectedPointTime] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  
  const chartRef = useRef(null);
  const tableRef = useRef(null);

  const handleCalculate = async (date) => {
    setLoading(true);
    setSelectedDate(date);
    setSelectedPointTime(null); 
    setTimeout(() => {
      const hardcodedData = generateHardcodedData(date);
      setTemperatureData(hardcodedData);
      setLoading(false);
    }, 1000);
  };

  const generateHardcodedData = (centerDate) => {
    const data = [];
    const startDate = new Date(centerDate);
    startDate.setDate(startDate.getDate() - 1);
    startDate.setHours(0, 0, 0, 0);

    const totalPoints = 72 * 4;
    for (let i = 0; i < totalPoints; i++) {
      const time = new Date(startDate);
      time.setMinutes(time.getMinutes() + i * 15);

      const hourOffset = i / 4;
      let value;
      
      if (hourOffset < 24) {
        value = 20 + Math.random() * 5;
      }
      else if (hourOffset >= 24 && hourOffset < 48) {
        const hourOfDay = hourOffset - 24;
        if (hourOfDay < 12) {
          value = 20 + Math.random() * 5;
        } else if (hourOfDay < 20) {
          const dropProgress = (hourOfDay - 12) / 8;
          value = 20 - dropProgress * 50 + Math.random() * 3;
        } else {
          value = -25 - Math.random() * 5;
        }
      }
      else {
        const hourOfDay = hourOffset - 48;
        if (hourOfDay < 8) {
          value = -20 + (hourOfDay / 8) * 15 + Math.random() * 3;
        } else {
          value = -5 + ((hourOfDay - 8) / 16) * 25 + Math.random() * 5;
        }
      }

      data.push({
        time: time.toISOString(),
        value: Math.round(value * 10) / 10,
      });
    }

    return {
      data,
      latitude: -32.0,
      longitude: -54.0,
      resolution: '15min',
      units: '°C',
      variable: 'cloudTemperature',
    };
  };

  const handlePointClick = (timeString) => {
    setSelectedPointTime(timeString);
  };

  const handleDownloadPDF = async () => {
    if (!temperatureData) {
      console.warn('No data available to export');
      return;
    }

    setIsExporting(true);
    
    try {
      const dateStr = selectedDate 
        ? selectedDate.toLocaleDateString('es-AR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
          }).replace(/\//g, '-')
        : 'sin-fecha';

      const filename = `granizo-reporte-${dateStr}`;

      const elements = [];

      if (chartRef.current) {
        elements.push({
          ref: chartRef,
          name: 'Gráfica de Temperatura',
        });
      }

      if (tableRef.current && selectedPointTime) {
        elements.push({
          ref: tableRef,
          name: 'Tabla de Valores',
        });
      }

      if (elements.length === 0) {
        console.warn('No elements to export');
        return;
      }

      await exportToPDF(elements, filename);
      
      console.log('✅ PDF exported successfully');
    } catch (error) {
      console.error('❌ Error exporting PDF:', error);
      alert('Error al generar el PDF. Por favor, intente nuevamente.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <ViewContainer>
      <Header
        onCalculate={handleCalculate}
        onDownloadPDF={handleDownloadPDF}
        loading={loading || isExporting}
        hasData={!!temperatureData}
      />
      <ContentArea>
        {temperatureData && (
          <>
            <TemperatureChart 
              ref={chartRef}
              data={temperatureData} 
              selectedDate={selectedDate}
              selectedPointTime={selectedPointTime}
              onPointClick={handlePointClick}
            />
            <TemperatureTable 
              ref={tableRef}
              data={temperatureData} 
              selectedDate={selectedDate}
              selectedPointTime={selectedPointTime}
            />
          </>
        )}
        {!temperatureData && !loading && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              minHeight: '400px',
              color: '#6b7280',
              fontSize: '1.125rem',
              fontFamily: "'Poppins', sans-serif",
            }}
          >
            Seleccione una fecha y presione "Calcular" para ver los datos
          </Box>
        )}
        {loading && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              minHeight: '400px',
              color: '#6b7280',
              fontSize: '1.125rem',
              fontFamily: "'Poppins', sans-serif",
            }}
          >
            {isExporting ? 'Generando PDF...' : 'Cargando datos...'}
          </Box>
        )}
      </ContentArea>
    </ViewContainer>
  );
}

export default GranizoView;