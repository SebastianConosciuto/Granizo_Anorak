import React, { useState, useRef, useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import Header from './components/Header';
import TemperatureChart from './components/TemperatureChart';
import TemperatureTable from './components/TemperatureTable';
import { exportToPDF } from '../../utils/exportUtils';
import {
  getTimeZone,
  getUtcDateRangeForLocalDay,
  localDateKey,
  inZone,
} from '../../utils/timezone';

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

// Helper function to parse WKT POINT string
const parseWKTPoint = (wktPoint) => {
  const match = wktPoint.match(/POINT\s*\(\s*([-\d.]+)\s+([-\d.]+)\s*\)/i);
  if (match) {
    const lon = parseFloat(match[1]);
    const lat = parseFloat(match[2]);
    return { lat, lon };
  }
  return null;
};

// Fetch cloud top temperature data from API
const fetchCloudTemperatureData = async (lat, lon, date, token, timeZone) => {
  // Request the UTC date range that fully covers the selected field-local day.
  // For negative offsets (e.g. UTC-3) the local day spans two UTC dates.
  const { startDate, endDate } = getUtcDateRangeForLocalDay(date, timeZone);
  const url = `https://clima.auravant.com/api/data/point?variable=cloud_temp&lat=${lat}&lon=${lon}&start_date=${startDate}&end_date=${endDate}&resolution=max`;

  console.log('Fetching cloud temperature data from:', url);
  console.log('Using token:', token ? `${token.substring(0, 30)}...` : 'NO TOKEN');

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer ' + token,
      },
    });

    console.log('Response status:', response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error Response:', errorText);
      
      // Handle 404 as "no data available"
      if (response.status === 404) {
        return { noData: true };
      }
      
      // Handle other errors with Spanish messages
      if (response.status === 401 || response.status === 403) {
        throw new Error('Error de autenticación. Por favor, recargue la página e intente nuevamente.');
      }
      if (response.status >= 500) {
        throw new Error('El servidor no está disponible en este momento. Por favor, intente más tarde.');
      }
      
      throw new Error(`Error al conectar con el servidor (código: ${response.status})`);
    }

    const data = await response.json();
    
    // Check for "No data available" error response
    if (data.error === "No data available") {
      return { noData: true };
    }

    console.log('API Success! Data points:', data.data?.length);
    return data;
  } catch (error) {
    console.error('Error fetching cloud temperature data:', error);
    throw error;
  }
};

function GranizoView() {
  const [temperatureData, setTemperatureData] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedPointTime, setSelectedPointTime] = useState(null);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [originalCoordinate, setOriginalCoordinate] = useState(null);
  const [error, setError] = useState(null);
  const [noCloudData, setNoCloudData] = useState(false);
  const [fieldSelected, setFieldSelected] = useState(false);
  const [checkingField, setCheckingField] = useState(true);
  
  const chartRef = useRef(null);
  const tableRef = useRef(null);

  // Check if a field is selected on mount
  useEffect(() => {
    const checkFieldSelection = async () => {
      setCheckingField(true);
      try {
        if (typeof avt !== 'undefined' && avt.state && avt.state.async_getActualField) {
          const fieldResponse = await avt.state.async_getActualField();
          console.log('Field check response:', fieldResponse);
          
          if (fieldResponse.result === 'success' && fieldResponse.info && fieldResponse.info.centroide) {
            const coords = parseWKTPoint(fieldResponse.info.centroide);
            if (coords) {
              setFieldSelected(true);
              console.log('Field is selected:', coords);
            } else {
              setFieldSelected(false);
              console.log('No valid coordinates in field');
            }
          } else {
            setFieldSelected(false);
            console.log('No field selected');
          }
        } else {
          // SDK not available, assume no field (or in dev mode)
          setFieldSelected(false);
          console.log('SDK not available for field check');
        }
      } catch (err) {
        console.error('Error checking field selection:', err);
        setFieldSelected(false);
      } finally {
        setCheckingField(false);
      }
    };

    checkFieldSelection();

    // Listen for field selection changes using the SDK's fieldSelected event
    const handleFieldSelected = (event) => {
      console.log('fieldSelected event received:', event.detail);
      checkFieldSelection();
    };

    // Listen for selector reset (when user clicks the home icon to deselect)
    const handleSelectorReset = () => {
      console.log('selectorReseted event received');
      setFieldSelected(false);
    };

    window.addEventListener('fieldSelected', handleFieldSelected);
    window.addEventListener('selectorReseted', handleSelectorReset);

    // Cleanup event listeners on unmount
    return () => {
      window.removeEventListener('fieldSelected', handleFieldSelected);
      window.removeEventListener('selectorReseted', handleSelectorReset);
    };
  }, []);

  const handleCalculate = async (date) => {
    setLoading(true);
    setSelectedDate(date);
    setSelectedPointTime(null);
    setError(null);
    setTemperatureData(null);
    setNoCloudData(false);

    try {
      let lat, lon, token;
      
      try {
        // Get the currently selected field using the correct SDK method
        const fieldResponse = await avt.state.async_getActualField();
        
        console.log('Field response:', fieldResponse);
        
        if (fieldResponse.result === 'success' && fieldResponse.info) {
          // Parse the centroide WKT string: "POINT(lon lat)"
          const coords = parseWKTPoint(fieldResponse.info.centroide);
          if (coords) {
            lat = coords.lat;
            lon = coords.lon;
            console.log('Parsed coordinates:', { lat, lon });
          } else {
            throw new Error('Could not parse centroide');
          }
        } else {
          throw new Error('No field selected');
        }
        
        // Get the authentication token
        console.log('=== Token Debug ===');
        console.log('Checking token locations:');
        
        let foundToken = null;
        
        // Method 1: Check window.token
        if (typeof window !== 'undefined' && window.token) {
          console.log('  - window.token: FOUND');
          foundToken = window.token;
        } else {
          console.log('  - window.token: not found');
        }
        
        // Method 2: Check avt.token (just in case)
        if (!foundToken && avt.token) {
          console.log('  - avt.token: FOUND');
          foundToken = avt.token;
        } else if (!foundToken) {
          console.log('  - avt.token: not found');
        }
        
        // Method 3: Try to evaluate 'token' as a global
        if (!foundToken) {
          try {
            // eslint-disable-next-line no-eval
            const evalToken = eval('typeof token !== "undefined" ? token : null');
            if (evalToken) {
              console.log('  - global token (eval): FOUND');
              foundToken = evalToken;
            }
          } catch (e) {
            console.log('  - global token (eval): error', e.message);
          }
        }
        
        if (foundToken) {
          token = foundToken;
          console.log('Token obtained successfully!');
        } else {
          console.warn('No token found in any location');
          throw new Error('No token available');
        }
      } catch (sdkError) {
        console.warn('Could not get coordinates from SDK, using defaults:', sdkError);
        // Fallback coordinates for testing
        lat = -32;
        lon = -54;
        token = 'test-token';
      }

      setOriginalCoordinate({ lat, lon });

      // Resolve the field's local timezone from its coordinates (UTC-3 for
      // lat -36 / lon -62). All hours are shown/requested in this zone.
      const timeZone = getTimeZone(lat, lon);

      // Fetch data from API
      try {
        const apiData = await fetchCloudTemperatureData(lat, lon, date, token, timeZone);

        // One-time diagnostic: surface any timezone/offset field the API returns.
        console.log('API response keys:', Object.keys(apiData || {}));

        // Check if no cloud data was available
        if (apiData.noData) {
          setNoCloudData(true);
          setTemperatureData(null);
          return;
        }

        // Keep only samples that fall within the selected field-local day, so
        // the chart/table show exactly that calendar day (not a shifted UTC day).
        const { pickedDay } = getUtcDateRangeForLocalDay(date, timeZone);
        const dayData = Array.isArray(apiData.data)
          ? apiData.data.filter((item) => localDateKey(item.time, timeZone) === pickedDay)
          : apiData.data;

        // Process the API response
        const processedData = {
          data: dayData,
          latitude: apiData.latitude,
          longitude: apiData.longitude,
          resolution: apiData.resolution,
          units: apiData.units,
          variable: apiData.variable,
          timeZone,
        };

        setTemperatureData(processedData);
      } catch (apiError) {
        console.error('API error:', apiError);
        setError(apiError.message);
      }

    } catch (err) {
      console.error('Error calculating data:', err);
      setError(`Error inesperado: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handlePointClick = (timeString) => {
    setSelectedPointTime(timeString);
  };

  const handleDownloadPDF = async () => {
    if (!temperatureData) {
      console.warn('No data available to export');
      return;
    }

    setExporting(true);
    
    try {
      const dateStr = selectedDate
        ? getUtcDateRangeForLocalDay(selectedDate, temperatureData?.timeZone).pickedDay
        : 'fecha';

      const filename = `granizo_${dateStr}`;

      const elements = [];

      if (chartRef.current) {
        elements.push({
          ref: chartRef,
          name: 'Gráfica de Temperatura de Tope de Nube',
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
    } catch (err) {
      console.error('❌ Error exporting PDF:', err);
      alert('Error al generar el PDF. Por favor, intente nuevamente.');
    } finally {
      setExporting(false);
    }
  };

  return (
    <ViewContainer>
      <Header
        onCalculate={handleCalculate}
        onDownloadPDF={handleDownloadPDF}
        loading={loading}
        exporting={exporting}
        hasData={!!temperatureData}
        fieldSelected={fieldSelected}
        checkingField={checkingField}
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
        {/* No cloud data message */}
        {noCloudData && !loading && (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              minHeight: '400px',
              padding: '1rem',
              textAlign: 'center',
            }}
          >
            <Box
              sx={{
                backgroundColor: '#e0f2fe',
                border: '1px solid #7dd3fc',
                borderRadius: '12px',
                padding: '1.5rem',
                maxWidth: '500px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.75rem',
              }}
            >
              <span 
                className="material-symbols-outlined" 
                style={{ 
                  fontSize: '2.5rem', 
                  color: '#0284c7' 
                }}
              >
                cloud_off
              </span>
              <Typography
                sx={{
                  fontFamily: "'Poppins', sans-serif",
                  fontSize: '1.125rem',
                  fontWeight: 600,
                  color: '#075985',
                }}
              >
                Sin datos de nubes
              </Typography>
              <Typography
                sx={{
                  fontFamily: "'Poppins', sans-serif",
                  fontSize: '0.875rem',
                  color: '#0369a1',
                  lineHeight: 1.5,
                }}
              >
                No hay datos de nubes en la fecha seleccionada para esta ubicación.
              </Typography>
            </Box>
          </Box>
        )}
        {/* Error message */}
        {error && !loading && (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              minHeight: '400px',
              padding: '1rem',
              textAlign: 'center',
            }}
          >
            <Box
              sx={{
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '12px',
                padding: '1.5rem',
                maxWidth: '500px',
              }}
            >
              <Typography
                sx={{
                  fontFamily: "'Poppins', sans-serif",
                  fontSize: '1.125rem',
                  fontWeight: 600,
                  color: '#dc2626',
                  marginBottom: '0.5rem',
                }}
              >
                Error al obtener datos
              </Typography>
              <Typography
                sx={{
                  fontFamily: "'Poppins', sans-serif",
                  fontSize: '0.875rem',
                  color: '#991b1b',
                }}
              >
                {error}
              </Typography>
            </Box>
          </Box>
        )}
        {/* No field selected warning */}
        {!temperatureData && !loading && !error && !noCloudData && !fieldSelected && !checkingField && (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              minHeight: '400px',
              padding: '1rem',
              textAlign: 'center',
            }}
          >
            <Box
              sx={{
                backgroundColor: '#fef3c7',
                border: '1px solid #f59e0b',
                borderRadius: '12px',
                padding: '1.5rem',
                maxWidth: '500px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.75rem',
              }}
            >
              <span 
                className="material-symbols-outlined" 
                style={{ 
                  fontSize: '2.5rem', 
                  color: '#d97706' 
                }}
              >
                warning
              </span>
              <Typography
                sx={{
                  fontFamily: "'Poppins', sans-serif",
                  fontSize: '1.125rem',
                  fontWeight: 600,
                  color: '#92400e',
                }}
              >
                No hay lote seleccionado
              </Typography>
              <Typography
                sx={{
                  fontFamily: "'Poppins', sans-serif",
                  fontSize: '0.875rem',
                  color: '#a16207',
                  lineHeight: 1.5,
                }}
              >
                Por favor, seleccione un lote en el mapa de Auravant antes de realizar el análisis de granizo.
              </Typography>
            </Box>
          </Box>
        )}
        {/* Ready to calculate message */}
        {!temperatureData && !loading && !error && !noCloudData && fieldSelected && (
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
              textAlign: 'center',
              padding: '1rem',
            }}
          >
            Seleccione una fecha y presione "Calcular" para ver los datos de temperatura de tope de nube
          </Box>
        )}
        {/* Loading message */}
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
            Cargando datos de temperatura de tope de nube...
          </Box>
        )}
        {/* Checking field message */}
        {checkingField && !loading && (
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
            Verificando selección de lote...
          </Box>
        )}
      </ContentArea>
    </ViewContainer>
  );
}

export default GranizoView;