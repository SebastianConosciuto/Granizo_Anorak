import React, { useState } from 'react';
import { Box } from '@mui/material';
import { styled } from '@mui/material/styles';
import Header from './components/Header';
import TemperatureChart from './components/TemperatureChart';
import TemperatureTable from './components/TemperatureTable';

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

  const handleCalculate = async (date) => {
    setLoading(true);
    setSelectedDate(date);
    setSelectedPointTime(null); // Reset selected point

    // TODO: Implement actual API call
    // Get polygon coordinates from Auravant SDK
    // const polygon = await avt.map.getSelectedPolygon();
    // const lat = polygon.centroid.lat;
    // const lon = polygon.centroid.lon;

    // Calculate day before and after
    // const dayBefore = new Date(date);
    // dayBefore.setDate(dayBefore.getDate() - 1);
    // const dayAfter = new Date(date);
    // dayAfter.setDate(dayAfter.getDate() + 1);

    // const formatDate = (date) => {
    //   return date.toISOString().split('T')[0];
    // };

    // const response = await fetch(
    //   `http://10.0.26.216:5900/api/data/point?lat=${lat}&lon=${lon}&start_date=${formatDate(dayBefore)}&end_date=${formatDate(dayAfter)}&variable=cloudTemperature&resolution=15min`
    // );
    // const data = await response.json();

    // Hardcoded data for demonstration
    setTimeout(() => {
      const hardcodedData = generateHardcodedData(date);
      setTemperatureData(hardcodedData);
      setLoading(false);
    }, 1000);
  };

  const generateHardcodedData = (centerDate) => {
    const data = [];
    const startDate = new Date(centerDate);
    // Start from the day before
    startDate.setDate(startDate.getDate() - 1);
    startDate.setHours(0, 0, 0, 0);

    // Generate 72 hours of data with 15-minute intervals (72 * 4 = 288 points)
    const totalPoints = 72 * 4;
    for (let i = 0; i < totalPoints; i++) {
      const time = new Date(startDate);
      time.setMinutes(time.getMinutes() + i * 15);

      const hourOffset = i / 4; // Convert 15-min intervals to hours
      let value;
      
      // Day before: Normal temperature around 20°C
      if (hourOffset < 24) {
        value = 20 + Math.random() * 5;
      }
      // Selected day: Temperature drop (frost event)
      else if (hourOffset >= 24 && hourOffset < 48) {
        const hourOfDay = hourOffset - 24;
        if (hourOfDay < 12) {
          // Morning: still normal
          value = 20 + Math.random() * 5;
        } else if (hourOfDay < 20) {
          // Afternoon to evening: rapid drop
          const dropProgress = (hourOfDay - 12) / 8;
          value = 20 - dropProgress * 50 + Math.random() * 3;
        } else {
          // Night: very cold
          value = -25 - Math.random() * 5;
        }
      }
      // Day after: Recovery
      else {
        const hourOfDay = hourOffset - 48;
        if (hourOfDay < 8) {
          // Early morning: still cold
          value = -20 + (hourOfDay / 8) * 15 + Math.random() * 3;
        } else {
          // Warming up
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

  const handleDownloadPDF = () => {
    // TODO: Implement PDF generation
    console.log('Downloading PDF...');
    // This would use a library like jsPDF or html2canvas to capture
    // the chart and table components and generate a PDF
  };

  return (
    <ViewContainer>
      <Header
        onCalculate={handleCalculate}
        onDownloadPDF={handleDownloadPDF}
        loading={loading}
        hasData={!!temperatureData}
      />
      <ContentArea>
        {temperatureData && (
          <>
            <TemperatureChart 
              data={temperatureData} 
              selectedDate={selectedDate}
              selectedPointTime={selectedPointTime}
              onPointClick={handlePointClick}
            />
            <TemperatureTable 
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
            Cargando datos...
          </Box>
        )}
      </ContentArea>
    </ViewContainer>
  );
}

export default GranizoView;