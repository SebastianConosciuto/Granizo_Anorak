import React, { useMemo, forwardRef } from 'react';
import { Box, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  ReferenceArea,
} from 'recharts';

const ChartContainer = styled(Box)({
  backgroundColor: '#ffffff',
  borderRadius: '16px',
  padding: '1rem',
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
  outline: 'none',
  
  '&:focus': {
    outline: 'none',
  },
  
  '& *:focus': {
    outline: 'none',
  },
});

const ChartHeader = styled(Box)({
  marginBottom: '1rem',
});

const ChartTitle = styled(Typography)({
  fontFamily: "'Poppins', sans-serif",
  fontSize: '1.125rem',
  fontWeight: 600,
  color: '#263238',
});

const ChartFooter = styled(Box)({
  marginTop: '1rem',
  display: 'flex',
  flexDirection: 'column',
  gap: '0.5rem',
});

const InfoText = styled(Typography)({
  fontFamily: "'Poppins', sans-serif",
  fontSize: '0.75rem',
  fontWeight: 400,
  color: '#1A8F89',
  fontStyle: 'italic',
});

const DataSourceSection = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  marginTop: '0.25rem',
});

const DataSourceLabel = styled(Typography)({
  fontFamily: "'Poppins', sans-serif",
  fontSize: '0.75rem',
  fontWeight: 600,
  color: '#263238',
});

const LearnMoreLink = styled(Typography)({
  fontFamily: "'Poppins', sans-serif",
  fontSize: '0.75rem',
  fontWeight: 400,
  color: '#1A8F89',
  cursor: 'pointer',
  textDecoration: 'underline',
  
  '&:hover': {
    color: '#157f7a',
  },
});

const LegendContainer = styled(Box)({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  gap: '1.5rem',
  marginTop: '0.5rem',
  flexWrap: 'wrap',
});

const LegendItem = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
});

const LegendColor = styled(Box)(({ color, isArea }) => ({
  width: isArea ? '20px' : '20px',
  height: isArea ? '12px' : '4px',
  backgroundColor: color,
  borderRadius: isArea ? '2px' : '2px',
  opacity: isArea ? 0.6 : 1,
}));

const LegendText = styled(Typography)({
  fontFamily: "'Poppins', sans-serif",
  fontSize: '0.75rem',
  fontWeight: 500,
  color: '#6b7280',
});

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    
    // Check if this is a null (no cloud) point
    if (data.payload.isNull) {
      const date = new Date(data.payload.time);
      const formattedDate = date.toLocaleDateString('es-AR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
      const formattedTime = date.toLocaleTimeString('es-AR', {
        hour: '2-digit',
        minute: '2-digit',
      });

      return (
        <Box
          sx={{
            backgroundColor: '#e0f2fe',
            border: '1px solid #7dd3fc',
            borderRadius: '8px',
            padding: '0.75rem',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
          }}
        >
          <Typography
            sx={{
              fontFamily: "'Poppins', sans-serif",
              fontSize: '0.75rem',
              color: '#6b7280',
              marginBottom: '0.25rem',
            }}
          >
            {formattedDate} - {formattedTime}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '1rem', color: '#0284c7' }}>
              cloud_off
            </span>
            <Typography
              sx={{
                fontFamily: "'Poppins', sans-serif",
                fontSize: '0.875rem',
                fontWeight: 600,
                color: '#0284c7',
              }}
            >
              Sin nubes detectadas
            </Typography>
          </Box>
        </Box>
      );
    }

    const date = new Date(data.payload.time);
    const formattedDate = date.toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
    const formattedTime = date.toLocaleTimeString('es-AR', {
      hour: '2-digit',
      minute: '2-digit',
    });

    return (
      <Box
        sx={{
          backgroundColor: '#ffffff',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          padding: '0.75rem',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
        }}
      >
        <Typography
          sx={{
            fontFamily: "'Poppins', sans-serif",
            fontSize: '0.75rem',
            color: '#6b7280',
            marginBottom: '0.25rem',
          }}
        >
          {formattedDate} - {formattedTime}
        </Typography>
        <Typography
          sx={{
            fontFamily: "'Poppins', sans-serif",
            fontSize: '1rem',
            fontWeight: 600,
            color: data.value < -40 ? '#dc2626' : data.value < -20 ? '#f59e0b' : '#1A8F89',
          }}
        >
          {data.value.toFixed(1)}°C
        </Typography>
        <Typography
          sx={{
            fontFamily: "'Poppins', sans-serif",
            fontSize: '0.7rem',
            color: '#9ca3af',
            marginTop: '0.25rem',
          }}
        >
          Click para ver tabla
        </Typography>
      </Box>
    );
  }
  return null;
};

const CustomDot = (props) => {
  const { cx, cy, payload, selectedPointTime, onClick } = props;
  
  // Don't render dot for null values
  if (payload.isNull || payload.temperature === null) {
    return null;
  }
  
  const isSelected = selectedPointTime && payload.time === selectedPointTime;
  const temp = payload.temperature;
  
  // Color based on temperature thresholds for hail risk
  const getColor = () => {
    if (temp <= -40) return '#dc2626'; // High risk - red
    if (temp <= -20) return '#f59e0b'; // Moderate risk - orange
    return '#1A8F89'; // Low risk - teal
  };
  
  const handleDotClick = (e) => {
    e.stopPropagation();
    if (onClick) {
      onClick(payload);
    }
  };
  
  if (isSelected) {
    return (
      <g onClick={handleDotClick} style={{ cursor: 'pointer' }}>
        <circle
          cx={cx}
          cy={cy}
          r={8}
          fill="#fbbf24"
          stroke="#f59e0b"
          strokeWidth={2}
        />
        <circle
          cx={cx}
          cy={cy}
          r={4}
          fill="#ffffff"
        />
      </g>
    );
  }
  
  return (
    <circle
      cx={cx}
      cy={cy}
      r={4}
      fill={getColor()}
      stroke="#ffffff"
      strokeWidth={1.5}
      onClick={handleDotClick}
      style={{ cursor: 'pointer' }}
    />
  );
};

const TemperatureChart = forwardRef(({ data, selectedDate, selectedPointTime, onPointClick }, ref) => {
  if (!data || !data.data) return null;

  // Transform data and identify null regions
  const { chartData, nullRegions } = useMemo(() => {
    const processedData = data.data.map((item) => {
      const date = new Date(item.time);
      return {
        time: item.time,
        temperature: item.value,
        isNull: item.value === null,
        displayTime: date.toLocaleTimeString('es-AR', {
          hour: '2-digit',
          minute: '2-digit',
        }),
        displayDate: date.toLocaleDateString('es-AR', {
          day: '2-digit',
          month: '2-digit',
        }),
      };
    });

    // Find consecutive null regions for shading
    const regions = [];
    let regionStart = null;
    
    processedData.forEach((item, index) => {
      if (item.isNull) {
        if (regionStart === null) {
          regionStart = item.time;
        }
      } else {
        if (regionStart !== null) {
          // End of null region
          regions.push({
            start: regionStart,
            end: processedData[index - 1].time,
          });
          regionStart = null;
        }
      }
    });
    
    // Handle case where data ends with nulls
    if (regionStart !== null) {
      regions.push({
        start: regionStart,
        end: processedData[processedData.length - 1].time,
      });
    }

    return { chartData: processedData, nullRegions: regions };
  }, [data]);

  const formatXAxis = (value) => {
    const date = new Date(value);
    const hour = date.getHours();
    const minute = date.getMinutes();

    if (hour === 0 && minute === 0) {
      return date.toLocaleDateString('es-AR', {
        day: '2-digit',
        month: '2-digit',
        year: '2-digit',
      });
    } 
    else if (minute === 0 && hour % 6 === 0) {
      return date.toLocaleTimeString('es-AR', {
        hour: '2-digit',
        minute: '2-digit',
      });
    }
    return '';
  };

  const customTicks = useMemo(() => {
    if (!chartData || chartData.length === 0) return [];
    
    const ticks = [];
    chartData.forEach((item) => {
      const date = new Date(item.time);
      const hour = date.getHours();
      const minute = date.getMinutes();
      
      if ((hour === 0 && minute === 0) || (minute === 0 && hour % 6 === 0)) {
        ticks.push(item.time);
      }
    });
    
    return ticks;
  }, [chartData]);

  const handleChartClick = (data) => {
    if (data && data.activePayload && data.activePayload.length > 0) {
      const clickedData = data.activePayload[0].payload;
      // Don't allow clicking on null points
      if (!clickedData.isNull && clickedData.temperature !== null) {
        onPointClick(clickedData.time);
      }
    }
  };

  const handleDotClickWrapper = (payload) => {
    if (payload && payload.time && !payload.isNull) {
      onPointClick(payload.time);
    }
  };

  const handleLearnMore = () => {
    // GOES-16 satellite info
    const url = 'https://www.goes.noaa.gov/';
    if (window.avt && window.avt.interface && window.avt.interface.openWindow) {
      window.avt.interface.openWindow(url);
    } else {
      window.open(url, '_blank');
    }
  };

  // Check if there are any null regions
  const hasNullRegions = nullRegions.length > 0;

  return (
    <ChartContainer ref={ref}>
      <ChartHeader>
        <ChartTitle>Temperatura de Tope de Nube (°C)</ChartTitle>
      </ChartHeader>

      <Box sx={{ outline: 'none', '&:focus': { outline: 'none' }, '& *': { outline: 'none !important' } }}>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart
            data={chartData}
            margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
            onClick={handleChartClick}
            style={{ outline: 'none' }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            
            {/* Render shaded areas for null (no cloud) regions */}
            {nullRegions.map((region, index) => (
              <ReferenceArea
                key={index}
                x1={region.start}
                x2={region.end}
                fill="#bae6fd"
                fillOpacity={0.4}
                stroke="#7dd3fc"
                strokeOpacity={0.6}
                strokeDasharray="3 3"
              />
            ))}
            
            <XAxis
              dataKey="time"
              ticks={customTicks}
              tickFormatter={formatXAxis}
              stroke="#6b7280"
              style={{
                fontFamily: "'Poppins', sans-serif",
                fontSize: '0.75rem',
              }}
              tick={{ fontSize: '0.75rem' }}
            />
            <YAxis
              stroke="#6b7280"
              style={{
                fontFamily: "'Poppins', sans-serif",
                fontSize: '0.75rem',
              }}
              label={{
                value: '°C',
                angle: -90,
                position: 'insideLeft',
                offset: 10,
                style: {
                  fontFamily: "'Poppins', sans-serif",
                  fontSize: '0.875rem',
                  fill: '#6b7280',
                  textAnchor: 'middle',
                },
              }}
            />
            <Tooltip content={<CustomTooltip />} />
            
            {/* Reference lines for risk thresholds */}
            <ReferenceLine 
              y={-40} 
              stroke="#dc2626" 
              strokeDasharray="5 5" 
              strokeWidth={1.5}
              label={{ 
                value: '-40°C (Alto riesgo)', 
                position: 'right', 
                fill: '#dc2626',
                fontSize: 10,
                fontFamily: "'Poppins', sans-serif",
              }}
            />
            <ReferenceLine 
              y={-20} 
              stroke="#f59e0b" 
              strokeDasharray="5 5" 
              strokeWidth={1.5}
              label={{ 
                value: '-20°C (Riesgo moderado)', 
                position: 'right', 
                fill: '#f59e0b',
                fontSize: 10,
                fontFamily: "'Poppins', sans-serif",
              }}
            />
            
            <Line
              type="monotone"
              dataKey="temperature"
              stroke="#1A8F89"
              strokeWidth={2}
              connectNulls={false}
              dot={(props) => (
                <CustomDot 
                  {...props} 
                  selectedPointTime={selectedPointTime} 
                  onClick={handleDotClickWrapper} 
                />
              )}
              activeDot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </Box>

      <ChartFooter>
        {/* Legend */}
        <LegendContainer>
          <LegendItem>
            <LegendColor color="#1A8F89" />
            <LegendText>Temperatura de tope de nube</LegendText>
          </LegendItem>
          {hasNullRegions && (
            <LegendItem>
              <LegendColor color="#bae6fd" isArea />
              <LegendText>Sin nubes detectadas</LegendText>
            </LegendItem>
          )}
        </LegendContainer>

        <InfoText>
          Haga click en un punto para ver las próximas 4 horas en la tabla
        </InfoText>
        
        <DataSourceSection>
          <DataSourceLabel>Fuente:</DataSourceLabel>
          <LearnMoreLink onClick={handleLearnMore}>
            GOES-16
          </LearnMoreLink>
        </DataSourceSection>
      </ChartFooter>
    </ChartContainer>
  );
});

TemperatureChart.displayName = 'TemperatureChart';

export default TemperatureChart;