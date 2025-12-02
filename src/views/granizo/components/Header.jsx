import React, { useState } from "react";
import { Box, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import "dayjs/locale/es";
import Button from "../../../components/button/button";
import Anorak_White_Granizo_NB from "../../../assets/Anorak_White_Granizo_NB.png";

const HeaderContainer = styled(Box)(({ theme }) => ({
  width: "100%",
  backgroundColor: "#263238",
  display: "flex",
  alignItems: "center",
  gap: "1.5rem",
  padding: "1rem 1.5rem",
  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
  flexWrap: "wrap",

  [theme.breakpoints.down("lg")]: {
    gap: "1rem",
    padding: "1rem",
  },

  [theme.breakpoints.down("md")]: {
    padding: "0.75rem",
    gap: "0",
    flexDirection: "column",
    alignItems: "stretch",
  },
}));

const MobileTopRow = styled(Box)(({ theme }) => ({
  display: "none",

  [theme.breakpoints.down("md")]: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: "0.75rem",
    position: "relative",
  },
}));

const MobileCenterTitle = styled(Box)(({ theme }) => ({
  display: "none",

  [theme.breakpoints.down("md")]: {
    display: "flex",
    position: "absolute",
    left: "50%",
    transform: "translateX(-50%)",
    pointerEvents: "none",
  },
}));

const MobileControlsRow = styled(Box)(({ theme }) => ({
  display: "none",

  [theme.breakpoints.down("md")]: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.75rem",
    width: "100%",
  },
}));

const LogoSection = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: "0.75rem",
  flexShrink: 0,

  [theme.breakpoints.down("md")]: {
    display: "none",
  },
}));

const Logo = styled("img")(({ theme }) => ({
  width: "100px",
  height: "91px",
  objectFit: "contain",
  flexShrink: 0,

  [theme.breakpoints.down("md")]: {
    width: "75px",
    height: "68px",
  },
}));

const Title = styled(Typography)(({ theme }) => ({
  fontFamily: "'Poppins', sans-serif",
  fontSize: "1.25rem",
  fontWeight: 600,
  color: "#ffffff",

  [theme.breakpoints.down("lg")]: {
    fontSize: "1.125rem",
  },

  [theme.breakpoints.down("md")]: {
    fontSize: "1rem",
  },
}));

const ControlsSection = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: "1rem",
  flex: 1,
  flexWrap: "wrap",

  [theme.breakpoints.down("md")]: {
    display: "none",
  },
}));

const DateSection = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: "0.75rem",

  [theme.breakpoints.down("md")]: {
    width: "100%",
  },
}));

const SectionLabel = styled(Typography)(({ theme }) => ({
  fontFamily: "'Poppins', sans-serif",
  fontSize: "0.875rem",
  fontWeight: 500,
  color: "#d1d5db",
  minWidth: "fit-content",

  [theme.breakpoints.down("md")]: {
    display: "none",
  },
}));

const StyledDatePicker = styled(DatePicker)(({ theme }) => ({
  minWidth: "180px",

  "& .MuiInputBase-root": {
    backgroundColor: "#37474f",
    borderRadius: "12px",
    border: "2px solid #455a64",
    fontFamily: "'Poppins', sans-serif",
    color: "#9ca3af",
    padding: "0.5rem 0.75rem",
    transition: "all 0.2s ease",
    height: "40px",

    "&:hover": {
      borderColor: "#1A8F89",

      "& .MuiOutlinedInput-notchedOutline": {
        border: "none",
      },
    },

    "&.Mui-focused": {
      borderColor: "#1A8F89",
      boxShadow: "0 0 0 3px rgba(26, 143, 137, 0.1)",

      "& .MuiOutlinedInput-notchedOutline": {
        border: "none",
      },
    },
  },

  "& .MuiOutlinedInput-notchedOutline": {
    border: "none",
  },

  "& .MuiInputBase-input": {
    fontFamily: "'Poppins', sans-serif",
    fontSize: "0.875rem",
    color: "#9ca3af !important",
    padding: 0,

    "&::placeholder": {
      color: "#9ca3af !important",
      opacity: "1 !important",
    },
  },

  "& .MuiInputAdornment-root": {
    marginLeft: 0,
    marginRight: "0.5rem",
  },

  "& .MuiIconButton-root": {
    color: "#9ca3af",
    padding: 0,

    "&:hover": {
      color: "#1A8F89",
      backgroundColor: "transparent",
    },
  },

  "& .MuiSvgIcon-root": {
    fontSize: "1.125rem",
  },

  [theme.breakpoints.down("md")]: {
    flex: "0 1 auto",
    minWidth: "120px",
    maxWidth: "150px",
  },
}));

const ButtonGroup = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: "0.75rem",
  marginLeft: "auto",

  [theme.breakpoints.down("md")]: {
    width: "100%",
    marginLeft: 0,
    flexDirection: "row",
    justifyContent: "space-between",
  },
}));

function Header({ onCalculate, onDownloadPDF, onBack, loading, hasData }) {
  const [selectedDate, setSelectedDate] = useState(null);

  const handleDateChange = (newDate) => {
    setSelectedDate(newDate);
  };

  const handleCalculateClick = () => {
    if (selectedDate) {
      onCalculate(selectedDate.toDate());
    }
  };

  const getTodayDate = () => {
    return dayjs();
  };

  return (
    <HeaderContainer>
      {/* Mobile Layout */}
      <MobileTopRow>
        <Logo src={Anorak_White_Granizo_NB} alt="Anorak" />
        <MobileCenterTitle>
          <Title>Granizo</Title>
        </MobileCenterTitle>
        {onBack && (
          <Button
            className="secondary"
            onClick={onBack}
            icon="arrow_back"
            text="Volver"
          />
        )}
      </MobileTopRow>

      <MobileControlsRow>
        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="es">
          <StyledDatePicker
            value={selectedDate}
            onChange={handleDateChange}
            maxDate={getTodayDate()}
            format="DD/MM/YYYY"
            openTo="day"
            views={["year", "month", "day"]}
            desktopModeMediaQuery="@media (min-width: 0px)"
            slotProps={{
              textField: {
                placeholder: "Fecha",
                InputProps: {
                  sx: {
                    color: selectedDate ? "#ffffff" : "#9ca3af",
                  },
                  readOnly: true,
                },
              },
              field: {
                readOnly: true,
              },
              popper: {
                sx: {
                  "& .MuiPaper-root": {
                    backgroundColor: "#263238",
                    color: "#ffffff",
                    borderRadius: "16px",
                    boxShadow: "0 8px 24px rgba(0, 0, 0, 0.3)",
                    border: "2px solid #455a64",
                    fontFamily: "'Poppins', sans-serif",

                    "& .MuiPickersCalendarHeader-root": {
                      color: "#ffffff",
                      paddingTop: "1rem",
                      paddingLeft: "1rem",
                      paddingRight: "1rem",
                      marginBottom: "0.5rem",
                    },

                    "& .MuiPickersCalendarHeader-label": {
                      fontFamily: "'Poppins', sans-serif",
                      fontSize: "1rem",
                      fontWeight: 600,
                      color: "#ffffff",
                    },

                    "& .MuiPickersArrowSwitcher-button": {
                      color: "#9ca3af",

                      "&:hover": {
                        backgroundColor: "rgba(26, 143, 137, 0.1)",
                        color: "#1A8F89",
                      },
                    },

                    "& .MuiDayCalendar-header": {
                      paddingLeft: "1rem",
                      paddingRight: "1rem",
                    },

                    "& .MuiDayCalendar-weekDayLabel": {
                      fontFamily: "'Poppins', sans-serif",
                      fontSize: "0.75rem",
                      fontWeight: 500,
                      color: "#9ca3af",
                    },

                    "& .MuiPickersDay-root": {
                      fontFamily: "'Poppins', sans-serif",
                      fontSize: "0.875rem",
                      color: "#ffffff",

                      "&:hover": {
                        backgroundColor: "rgba(26, 143, 137, 0.2)",
                      },

                      "&.Mui-selected": {
                        backgroundColor: "#1A8F89",
                        color: "#ffffff",
                        fontWeight: 600,

                        "&:hover": {
                          backgroundColor: "#157f7a",
                        },
                      },

                      "&.MuiPickersDay-today": {
                        border: "2px solid #1A8F89",
                        backgroundColor: "transparent",

                        "&:not(.Mui-selected)": {
                          color: "#1A8F89",
                        },
                      },
                    },

                    "& .MuiPickersDay-root.Mui-disabled": {
                      color: "#4a5568",
                    },

                    "& .MuiPickersYear-yearButton": {
                      fontFamily: "'Poppins', sans-serif",
                      fontSize: "0.875rem",
                      color: "#ffffff",

                      "&:hover": {
                        backgroundColor: "rgba(26, 143, 137, 0.2)",
                      },

                      "&.Mui-selected": {
                        backgroundColor: "#1A8F89",
                        color: "#ffffff",
                        fontWeight: 600,

                        "&:hover": {
                          backgroundColor: "#157f7a",
                        },
                      },
                    },

                    "& .MuiPickersMonth-monthButton": {
                      fontFamily: "'Poppins', sans-serif",
                      fontSize: "0.875rem",
                      color: "#ffffff",

                      "&:hover": {
                        backgroundColor: "rgba(26, 143, 137, 0.2)",
                      },

                      "&.Mui-selected": {
                        backgroundColor: "#1A8F89",
                        color: "#ffffff",
                        fontWeight: 600,

                        "&:hover": {
                          backgroundColor: "#157f7a",
                        },
                      },
                    },

                    "& .MuiDialogActions-root": {
                      padding: "1rem",

                      "& .MuiButton-root": {
                        fontFamily: "'Poppins', sans-serif",
                        fontSize: "0.875rem",
                        color: "#1A8F89",
                        textTransform: "none",

                        "&:hover": {
                          backgroundColor: "rgba(26, 143, 137, 0.1)",
                        },
                      },
                    },
                  },
                },
              },
            }}
          />
        </LocalizationProvider>

        <Button
          className="primary"
          onClick={handleCalculateClick}
          text={loading ? "Calculando..." : "Calcular"}
          icon={loading ? "hourglass_empty" : "calculate"}
          disabled={!selectedDate || loading}
        />

        <Button
          className="secondary"
          onClick={onDownloadPDF}
          text="Copiar"
          icon="content_copy"
          disabled={!hasData}
        />
      </MobileControlsRow>

      {/* Desktop Layout */}
      <LogoSection>
        <Logo src={Anorak_White_Granizo_NB} alt="Anorak" />
        <Title>Granizo</Title>
      </LogoSection>

      <ControlsSection>
        <DateSection>
          <SectionLabel>Fecha:</SectionLabel>
          <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="es">
            <StyledDatePicker
              value={selectedDate}
              onChange={handleDateChange}
              maxDate={getTodayDate()}
              format="DD/MM/YYYY"
              openTo="day"
              views={["year", "month", "day"]}
              desktopModeMediaQuery="@media (min-width: 0px)"
              slotProps={{
                textField: {
                  placeholder: "Seleccione una fecha",
                  InputProps: {
                    sx: {
                      color: selectedDate ? "#ffffff" : "#9ca3af",
                    },
                    readOnly: true,
                  },
                },
                field: {
                  readOnly: true,
                },
                popper: {
                  sx: {
                    "& .MuiPaper-root": {
                      backgroundColor: "#263238",
                      color: "#ffffff",
                      borderRadius: "16px",
                      boxShadow: "0 8px 24px rgba(0, 0, 0, 0.3)",
                      border: "2px solid #455a64",
                      fontFamily: "'Poppins', sans-serif",

                      "& .MuiPickersCalendarHeader-root": {
                        color: "#ffffff",
                        paddingTop: "1rem",
                        paddingLeft: "1rem",
                        paddingRight: "1rem",
                        marginBottom: "0.5rem",
                      },

                      "& .MuiPickersCalendarHeader-label": {
                        fontFamily: "'Poppins', sans-serif",
                        fontSize: "1rem",
                        fontWeight: 600,
                        color: "#ffffff",
                      },

                      "& .MuiPickersArrowSwitcher-button": {
                        color: "#9ca3af",

                        "&:hover": {
                          backgroundColor: "rgba(26, 143, 137, 0.1)",
                          color: "#1A8F89",
                        },
                      },

                      "& .MuiDayCalendar-header": {
                        paddingLeft: "1rem",
                        paddingRight: "1rem",
                      },

                      "& .MuiDayCalendar-weekDayLabel": {
                        fontFamily: "'Poppins', sans-serif",
                        fontSize: "0.75rem",
                        fontWeight: 500,
                        color: "#9ca3af",
                      },

                      "& .MuiPickersDay-root": {
                        fontFamily: "'Poppins', sans-serif",
                        fontSize: "0.875rem",
                        color: "#ffffff",

                        "&:hover": {
                          backgroundColor: "rgba(26, 143, 137, 0.2)",
                        },

                        "&.Mui-selected": {
                          backgroundColor: "#1A8F89",
                          color: "#ffffff",
                          fontWeight: 600,

                          "&:hover": {
                            backgroundColor: "#157f7a",
                          },
                        },

                        "&.MuiPickersDay-today": {
                          border: "2px solid #1A8F89",
                          backgroundColor: "transparent",

                          "&:not(.Mui-selected)": {
                            color: "#1A8F89",
                          },
                        },
                      },

                      "& .MuiPickersDay-root.Mui-disabled": {
                        color: "#4a5568",
                      },

                      "& .MuiPickersYear-yearButton": {
                        fontFamily: "'Poppins', sans-serif",
                        fontSize: "0.875rem",
                        color: "#ffffff",

                        "&:hover": {
                          backgroundColor: "rgba(26, 143, 137, 0.2)",
                        },

                        "&.Mui-selected": {
                          backgroundColor: "#1A8F89",
                          color: "#ffffff",
                          fontWeight: 600,

                          "&:hover": {
                            backgroundColor: "#157f7a",
                          },
                        },
                      },

                      "& .MuiPickersMonth-monthButton": {
                        fontFamily: "'Poppins', sans-serif",
                        fontSize: "0.875rem",
                        color: "#ffffff",

                        "&:hover": {
                          backgroundColor: "rgba(26, 143, 137, 0.2)",
                        },

                        "&.Mui-selected": {
                          backgroundColor: "#1A8F89",
                          color: "#ffffff",
                          fontWeight: 600,

                          "&:hover": {
                            backgroundColor: "#157f7a",
                          },
                        },
                      },

                      "& .MuiDialogActions-root": {
                        padding: "1rem",

                        "& .MuiButton-root": {
                          fontFamily: "'Poppins', sans-serif",
                          fontSize: "0.875rem",
                          color: "#1A8F89",
                          textTransform: "none",

                          "&:hover": {
                            backgroundColor: "rgba(26, 143, 137, 0.1)",
                          },
                        },
                      },
                    },
                  },
                },
              }}
            />
          </LocalizationProvider>
        </DateSection>

        <Button
          className="primary"
          onClick={handleCalculateClick}
          text={loading ? "Calculando..." : "Calcular"}
          icon={loading ? "hourglass_empty" : "calculate"}
          disabled={!selectedDate || loading}
        />
        <Button
          className="secondary"
          onClick={onDownloadPDF}
          text="Copiar"
          icon="content_copy"
          disabled={!hasData}
        />
        <ButtonGroup>
          {onBack && (
            <Button
              className="secondary"
              onClick={onBack}
              icon="arrow_back"
              text="Volver"
            />
          )}
        </ButtonGroup>
      </ControlsSection>
    </HeaderContainer>
  );
}

export default Header;
