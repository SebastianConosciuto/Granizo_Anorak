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
  Dot,
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
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  gap: '1rem',
  flexWrap: 'wrap',
});

const ChartTitleSection = styled(Box)({
  flex: 1,
  minWidth: '250px',
});

const ChartTitle = styled(Typography)({
  fontFamily: "'Poppins', sans-serif",
  fontSize: '1.125rem',
  fontWeight: 600,
  color: '#263238',
  marginBottom: '0.25rem',
});

const InfoText = styled(Typography)({
  fontFamily: "'Poppins', sans-serif",
  fontSize: '0.75rem',
  fontWeight: 400,
  color: '#1A8F89',
  marginTop: '0.5rem',
  fontStyle: 'italic',
});

const DataSourceSection = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-end',
  gap: '0.25rem',
});

const DataSourceLabel = styled(Typography)({
  fontFamily: "'Poppins', sans-serif",
  fontSize: '0.875rem',
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

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0];
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
            color: data.value < 0 ? '#3b82f6' : '#1A8F89',
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
  const isSelected = selectedPointTime && payload.time === selectedPointTime;
  const isNegative = payload.temperature < 0;
  
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
      fill={isNegative ? '#3b82f6' : '#1A8F89'}
      stroke="#ffffff"
      strokeWidth={1.5}
      onClick={handleDotClick}
      style={{ cursor: 'pointer' }}
    />
  );
};

const TemperatureChart = forwardRef(({ data, selectedDate, selectedPointTime, onPointClick }, ref) => {
  if (!data || !data.data) return null;

  const chartData = data.data.map((item) => {
    const date = new Date(item.time);
    return {
      time: item.time,
      temperature: item.value,
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
      const clickedTime = data.activePayload[0].payload.time;
      onPointClick(clickedTime);
    }
  };

  const handleDotClickWrapper = (payload) => {
    if (payload && payload.time) {
      onPointClick(payload.time);
    }
  };

  const handleLearnMore = () => {
    window.open('', '_blank');
  };

  return (
    <ChartContainer ref={ref}>
      <ChartHeader>
        <ChartTitleSection>
          <ChartTitle>Temperatura tope de nube ((°C)/Tiempo)</ChartTitle>
          <InfoText>
            Haga click en un punto para ver los próximos 4 horas en la tabla
          </InfoText>
        </ChartTitleSection>
        <DataSourceSection>
          <DataSourceLabel>GOES16</DataSourceLabel>
          <LearnMoreLink onClick={handleLearnMore}>
            Conocer más
          </LearnMoreLink>
        </DataSourceSection>
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
            <ReferenceLine y={0} stroke="#6b7280" strokeDasharray="3 3" />
            <Line
              type="monotone"
              dataKey="temperature"
              stroke="#1A8F89"
              strokeWidth={2}
              dot={(props) => <CustomDot {...props} selectedPointTime={selectedPointTime} onClick={handleDotClickWrapper} />}
              activeDot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </Box>
    </ChartContainer>
  );
});

TemperatureChart.displayName = 'TemperatureChart';

export default TemperatureChart;