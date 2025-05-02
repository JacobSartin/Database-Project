import { useState, useEffect, useMemo, FormEvent, KeyboardEvent } from "react";
import {
  Box,
  FormControl,
  RadioGroup,
  FormControlLabel,
  Radio,
  Button,
  Typography,
  MenuItem,
  Select,
  SelectChangeEvent,
  TextField,
  Autocomplete,
  Paper,
  CircularProgress,
  IconButton,
  useTheme,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { AirportOption } from "../types/flightTypes";
import api from "../services/api";
import Fuse from "fuse.js";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import FlightTakeoffIcon from "@mui/icons-material/FlightTakeoff";
import FlightLandIcon from "@mui/icons-material/FlightLand";
import PersonIcon from "@mui/icons-material/Person";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";

// Configure Fuse.js with more effective fuzzy search settings
const fuseOptions = {
  keys: ["label", "value"],
  includeScore: true,
  threshold: 0.3,
  findAllMatches: true,
  ignoreLocation: true,
  location: 0,
  distance: 100,
  minMatchCharLength: 1,
  shouldSort: true,
  tokenize: true,
  matchAllTokens: false,
};

type FlightSearchFormProps = {
  onSearch: (
    source: AirportOption,
    destination: AirportOption,
    departureDate: Date | null,
    returnDate: Date | null,
    passengers: number,
    tripType: string
  ) => void;
  initialValues?: {
    sourceAirport: AirportOption | null;
    destinationAirport: AirportOption | null;
    departureDate: Date | null;
    returnDate: Date | null;
    passengerCount: number;
    tripType: "oneWay" | "roundTrip";
  };
};

const FlightSearchForm: React.FC<FlightSearchFormProps> = ({
  onSearch,
  initialValues,
}) => {
  const theme = useTheme();
  const [sourceAirport, setSourceAirport] = useState<AirportOption | null>(
    initialValues?.sourceAirport || null
  );
  const [destinationAirport, setDestinationAirport] =
    useState<AirportOption | null>(initialValues?.destinationAirport || null);
  const [departureDate, setDepartureDate] = useState<Date | null>(
    initialValues?.departureDate || null
  );
  const [returnDate, setReturnDate] = useState<Date | null>(
    initialValues?.returnDate || null
  );
  const [tripType, setTripType] = useState<"oneWay" | "roundTrip">(
    initialValues?.tripType || "oneWay"
  );
  const [passengerCount, setPassengerCount] = useState<number>(
    initialValues?.passengerCount || 1
  );
  const [airportOptions, setAirportOptions] = useState<AirportOption[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Current date for min date on date pickers
  const today = new Date();

  // Load airports on component mount
  useEffect(() => {
    const loadAirports = async () => {
      setLoading(true);
      setError(null);
      try {
        const airports = await api.fetchAirports();
        setAirportOptions(airports);
      } catch (err) {
        console.error("Error fetching airports:", err);
        setError("Failed to load airports. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    loadAirports();
  }, []);

  // Create Fuse instance for fuzzy search
  const fuse = useMemo(
    () => new Fuse(airportOptions, fuseOptions),
    [airportOptions]
  );

  // Prevent form submission when pressing enter in airport fields
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
    }
  };

  // Handle form submission to search for flights
  const handleSearch = (e: FormEvent) => {
    e.preventDefault();

    if (!sourceAirport || !destinationAirport || !departureDate) {
      alert("Please fill in all required fields");
      return;
    }

    // Call the parent component's onSearch function with all the necessary parameters
    onSearch(
      sourceAirport,
      destinationAirport,
      departureDate,
      returnDate,
      passengerCount,
      tripType
    );
  };

  const handlePassengerChange = (event: SelectChangeEvent<number>) => {
    setPassengerCount(Number(event.target.value));
  };

  const handleTripTypeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTripType(event.target.value as "oneWay" | "roundTrip");
    // If switching to one-way, clear the return date
    if (event.target.value === "oneWay") {
      setReturnDate(null);
    }
  };

  const handleSwapAirports = () => {
    const temp = sourceAirport;
    setSourceAirport(destinationAirport);
    setDestinationAirport(temp);
  };

  return (
    <Paper
      elevation={3}
      sx={{
        borderRadius: 2,
        overflow: "hidden",
        width: "100%",
        boxSizing: "border-box",
        bgcolor: "#14161d",
        color: "white",
      }}
    >
      {/* Dark header section like Delta's */}
      <Box sx={{ p: 3, pb: 0 }}>
        <Typography
          variant="h5"
          gutterBottom
          component="h2"
          sx={{ color: "white", fontWeight: "bold", mb: 2 }}
        >
          Book a Flight
        </Typography>

        {error && (
          <Typography color="error" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}
      </Box>

      {/* Trip type selection styled like Delta */}
      <Box
        sx={{
          p: 3,
          pt: 0,
          mb: 0,
        }}
      >
        <FormControl component="fieldset" sx={{ width: "100%", mb: 2 }}>
          <RadioGroup
            row
            name="tripType"
            value={tripType}
            onChange={handleTripTypeChange}
            sx={{
              "& .MuiFormControlLabel-root": {
                color: "white",
                mr: 4,
              },
              "& .MuiRadio-root": {
                color: "white",
              },
              "& .Mui-checked": {
                color: theme.palette.primary.main,
              },
            }}
          >
            <FormControlLabel
              value="oneWay"
              control={<Radio />}
              label="One Way"
            />
            <FormControlLabel
              value="roundTrip"
              control={<Radio />}
              label="Round Trip"
            />
          </RadioGroup>
        </FormControl>
      </Box>

      <Box
        component="form"
        onSubmit={handleSearch}
        noValidate
        sx={{ width: "100%" }}
      >
        {/* Origin-Destination Section */}
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            p: 3,
            pt: 0,
            pb: 3,
            alignItems: "center",
            gap: 2,
          }}
        >
          <Box
            sx={{
              flex: 1,
              width: "100%",
              bgcolor: "rgba(255,255,255,0.12)",
              borderRadius: 1,
              p: 2,
              height: "120px",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
              <FlightTakeoffIcon sx={{ color: "white", mr: 1 }} />
              <Typography
                variant="body2"
                sx={{ color: "rgba(255,255,255,0.7)" }}
              >
                FROM
              </Typography>
            </Box>
            <Box
              sx={{
                position: "relative",
                height: "72px", // Exact height to fit all elements
                display: "flex",
                flexDirection: "column",
              }}
            >
              <Autocomplete
                id="source-airport"
                options={airportOptions}
                getOptionLabel={(option) => option.label}
                value={sourceAirport}
                onChange={(_, newValue) => {
                  setSourceAirport(newValue);
                }}
                loading={loading}
                onKeyDown={handleKeyDown}
                filterOptions={(options, state) => {
                  if (!state.inputValue) return options;
                  const results = fuse.search(state.inputValue);
                  return results.map((result) => result.item);
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    placeholder="Select origin"
                    required
                    fullWidth
                    variant="standard"
                    InputProps={{
                      ...params.InputProps,
                      disableUnderline: true,
                      endAdornment: (
                        <>
                          {loading ? (
                            <CircularProgress color="inherit" size={20} />
                          ) : null}
                          {params.InputProps.endAdornment}
                        </>
                      ),
                      sx: {
                        height: sourceAirport ? "40px" : "72px", // Fixed height regardless of content
                        fontSize: sourceAirport ? "2rem" : "1.2rem",
                        fontWeight: sourceAirport ? "700" : "400",
                        color: "white",
                        "&::placeholder": {
                          color: "rgba(255,255,255,0.7)",
                        },
                      },
                    }}
                    sx={{
                      "& .MuiInputBase-root": {
                        color: "white",
                      },
                      "& .MuiAutocomplete-endAdornment": {
                        color: "white",
                      },
                      // Hide default autocomplete clear button
                      "& .MuiAutocomplete-clearIndicator": {
                        color: "white",
                      },
                    }}
                    // Display only the code when selected but allow editing
                    inputProps={{
                      ...params.inputProps,
                      value: sourceAirport
                        ? sourceAirport.value
                        : params.inputProps.value,
                    }}
                  />
                )}
                sx={{
                  width: "100%",
                  "& .MuiAutocomplete-popupIndicator": {
                    color: "white", // White dropdown arrow
                  },
                  "& .MuiAutocomplete-clearIndicator": {
                    color: "white", // White clear button
                  },
                  "& .MuiAutocomplete-listbox": {
                    backgroundColor: "#1e2030", // Darker background for dropdown
                    color: "white", // White text for dropdown options
                  },
                }}
              />
              {sourceAirport && (
                <Typography
                  variant="caption"
                  sx={{
                    color: "rgba(255,255,255,0.7)",
                    mt: "4px",
                    height: "20px", // Fixed height for caption
                    display: "block",
                  }}
                >
                  {sourceAirport.label.split(" - ")[0]}
                </Typography>
              )}
            </Box>
          </Box>

          {/* Swap button between airports */}
          <IconButton
            onClick={handleSwapAirports}
            sx={{
              bgcolor: "rgba(255,255,255,0.1)",
              "&:hover": { bgcolor: "rgba(255,255,255,0.2)" },
              display: { xs: "none", md: "flex" },
            }}
          >
            <SwapHorizIcon sx={{ color: "white" }} />
          </IconButton>

          <Box
            sx={{
              flex: 1,
              width: "100%",
              bgcolor: "rgba(255,255,255,0.12)",
              borderRadius: 1,
              p: 2,
              height: "120px",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
              <FlightLandIcon sx={{ color: "white", mr: 1 }} />
              <Typography
                variant="body2"
                sx={{ color: "rgba(255,255,255,0.7)" }}
              >
                TO
              </Typography>
            </Box>
            <Box
              sx={{
                position: "relative",
                height: "72px", // Exact height to fit all elements
                display: "flex",
                flexDirection: "column",
              }}
            >
              <Autocomplete
                id="destination-airport"
                options={airportOptions}
                getOptionLabel={(option) => option.label}
                value={destinationAirport}
                onChange={(_, newValue) => {
                  setDestinationAirport(newValue);
                }}
                loading={loading}
                onKeyDown={handleKeyDown}
                filterOptions={(options, state) => {
                  if (!state.inputValue) return options;
                  const results = fuse.search(state.inputValue);
                  return results.map((result) => result.item);
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    placeholder="Select destination"
                    required
                    fullWidth
                    variant="standard"
                    InputProps={{
                      ...params.InputProps,
                      disableUnderline: true,
                      endAdornment: (
                        <>
                          {loading ? (
                            <CircularProgress color="inherit" size={20} />
                          ) : null}
                          {params.InputProps.endAdornment}
                        </>
                      ),
                      sx: {
                        height: destinationAirport ? "40px" : "72px", // Fixed height regardless of content
                        fontSize: destinationAirport ? "2rem" : "1.2rem",
                        fontWeight: destinationAirport ? "700" : "400",
                        color: "white",
                        "&::placeholder": {
                          color: "rgba(255,255,255,0.7)",
                        },
                      },
                    }}
                    sx={{
                      "& .MuiInputBase-root": {
                        color: "white",
                      },
                      "& .MuiAutocomplete-endAdornment": {
                        color: "white",
                      },
                      // Hide default autocomplete clear button
                      "& .MuiAutocomplete-clearIndicator": {
                        color: "white",
                      },
                    }}
                    // Display only the code when selected but allow editing
                    inputProps={{
                      ...params.inputProps,
                      value: destinationAirport
                        ? destinationAirport.value
                        : params.inputProps.value,
                    }}
                  />
                )}
                sx={{
                  width: "100%",
                  "& .MuiAutocomplete-popupIndicator": {
                    color: "white", // White dropdown arrow
                  },
                  "& .MuiAutocomplete-clearIndicator": {
                    color: "white", // White clear button
                  },
                  "& .MuiAutocomplete-listbox": {
                    backgroundColor: "#1e2030", // Darker background for dropdown
                    color: "white", // White text for dropdown options
                  },
                }}
              />
              {destinationAirport && (
                <Typography
                  variant="caption"
                  sx={{
                    color: "rgba(255,255,255,0.7)",
                    mt: "4px",
                    height: "20px", // Fixed height for caption
                    display: "block",
                  }}
                >
                  {destinationAirport.label.split(" - ")[0]}
                </Typography>
              )}
            </Box>
          </Box>
        </Box>

        {/* Dates and Passengers Section */}
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            p: 3,
            pt: 0,
            gap: 2,
          }}
        >
          <Box
            sx={{
              flex: 1,
              width: "100%",
              bgcolor: "rgba(255,255,255,0.12)",
              borderRadius: 1,
              p: 2,
              height: "120px", // Fixed height to match other fields
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
              <CalendarTodayIcon sx={{ color: "white", mr: 1 }} />
              <Typography
                variant="body2"
                sx={{ color: "rgba(255,255,255,0.7)" }}
              >
                DEPART
              </Typography>
            </Box>
            <Box
              sx={{
                height: "72px", // Fixed height to match other fields
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
              }}
            >
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  value={departureDate}
                  onChange={(newValue) => setDepartureDate(newValue)}
                  disablePast
                  slotProps={{
                    textField: {
                      required: true,
                      fullWidth: true,
                      variant: "standard",
                      InputProps: {
                        disableUnderline: true,
                        sx: {
                          fontSize: departureDate ? "1.5rem" : "1.2rem",
                          fontWeight: departureDate ? "600" : "400",
                          color: "white",
                          height: "40px", // Fixed height
                          "& .MuiSvgIcon-root": {
                            color: "white !important", // Force white color on calendar icon
                          },
                        },
                      },
                      placeholder: "Select date",
                      sx: {
                        "& .MuiInputBase-root": {
                          color: "white",
                        },
                        "& .MuiInputAdornment-root": {
                          color: "white !important", // Force white color on adornment
                        },
                        "& .MuiButtonBase-root": {
                          color: "white !important", // Force white on button
                        },
                      },
                    },
                    day: {
                      sx: {
                        color: "#ffffff",
                        "&.Mui-selected": {
                          backgroundColor: "#e51937", // Delta red for selected date
                          color: "white",
                        },
                      },
                    },
                    // Style the icons in the popup calendar
                    actionBar: {
                      sx: {
                        "& .MuiButtonBase-root": {
                          color: "white",
                        },
                      },
                    },
                  }}
                  sx={{
                    width: "100%",
                    "& .MuiInputBase-root": {
                      color: "white !important",
                    },
                    "& .MuiSvgIcon-root": {
                      color: "white !important", // Added !important to force white
                    },
                    "& .MuiButtonBase-root .MuiSvgIcon-root": {
                      color: "white !important", // Target icon within button
                    },
                    "& .MuiPickersPopper-paper": {
                      backgroundColor: "#1e2030",
                      color: "white",
                    },
                    "& .MuiPickersCalendarHeader-switchViewIcon": {
                      color: "white !important", // Calendar header icons
                    },
                  }}
                />
              </LocalizationProvider>
            </Box>
          </Box>

          {/* Always render the return date box but control its opacity and interactivity */}
          <Box
            sx={{
              flex: 1,
              width: "100%",
              bgcolor: "rgba(255,255,255,0.12)",
              borderRadius: 1,
              p: 2,
              height: "120px", // Fixed height to match other fields
              display: "flex",
              flexDirection: "column",
              opacity: tripType === "roundTrip" ? 1 : 0.4,
              pointerEvents: tripType === "roundTrip" ? "auto" : "none",
              transition: "opacity 0.3s ease",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
              <CalendarTodayIcon sx={{ color: "white", mr: 1 }} />
              <Typography
                variant="body2"
                sx={{ color: "rgba(255,255,255,0.7)" }}
              >
                RETURN
              </Typography>
            </Box>
            <Box
              sx={{
                height: "72px", // Fixed height to match other fields
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
              }}
            >
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  value={returnDate}
                  onChange={(newValue) => setReturnDate(newValue)}
                  disablePast
                  minDate={departureDate || today}
                  slotProps={{
                    textField: {
                      required: tripType === "roundTrip",
                      fullWidth: true,
                      variant: "standard",
                      InputProps: {
                        disableUnderline: true,
                        sx: {
                          fontSize: returnDate ? "1.5rem" : "1.2rem",
                          fontWeight: returnDate ? "600" : "400",
                          color: "white",
                          height: "40px", // Fixed height
                          "& .MuiSvgIcon-root": {
                            color: "white !important", // Force white color on calendar icon
                          },
                        },
                      },
                      placeholder: "Select date",
                      sx: {
                        "& .MuiInputBase-root": {
                          color: "white",
                        },
                        "& .MuiInputAdornment-root": {
                          color: "white !important", // Force white color on adornment
                        },
                        "& .MuiButtonBase-root": {
                          color: "white !important", // Force white on button
                        },
                      },
                    },
                    day: {
                      sx: {
                        color: "#ffffff",
                        "&.Mui-selected": {
                          backgroundColor: "#e51937",
                          color: "white",
                        },
                      },
                    },
                    // Style the icons in the popup calendar
                    actionBar: {
                      sx: {
                        "& .MuiButtonBase-root": {
                          color: "white",
                        },
                      },
                    },
                  }}
                  sx={{
                    width: "100%",
                    "& .MuiInputBase-root": {
                      color: "white !important",
                    },
                    "& .MuiSvgIcon-root": {
                      color: "white !important", // Added !important to force white
                    },
                    "& .MuiButtonBase-root .MuiSvgIcon-root": {
                      color: "white !important", // Target icon within button
                    },
                    "& .MuiPickersPopper-paper": {
                      // Calendar popup
                      backgroundColor: "#1e2030",
                      color: "white",
                    },
                    "& .MuiPickersCalendarHeader-switchViewIcon": {
                      color: "white !important", // Calendar header icons
                    },
                  }}
                />
              </LocalizationProvider>
            </Box>
          </Box>

          <Box
            sx={{
              flex: 1,
              width: "100%",
              bgcolor: "rgba(255,255,255,0.12)",
              borderRadius: 1,
              p: 2,
              height: "120px", // Fixed height to match other fields
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
              <PersonIcon sx={{ color: "white", mr: 1 }} />
              <Typography
                variant="body2"
                sx={{ color: "rgba(255,255,255,0.7)" }}
              >
                PASSENGERS
              </Typography>
            </Box>
            <Box
              sx={{
                height: "72px", // Fixed height to match other fields
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
              }}
            >
              <FormControl fullWidth variant="standard">
                <Select
                  id="passenger-count"
                  value={passengerCount}
                  onChange={handlePassengerChange}
                  disableUnderline
                  MenuProps={{
                    PaperProps: {
                      sx: {
                        bgcolor: "#1e2030",
                        color: "white",
                        "& .MuiMenuItem-root": {
                          color: "white",
                          "&:hover": {
                            bgcolor: "rgba(255,255,255,0.1)",
                          },
                          "&.Mui-selected": {
                            bgcolor: "rgba(229,25,55,0.2)",
                            "&:hover": {
                              bgcolor: "rgba(229,25,55,0.3)",
                            },
                          },
                        },
                      },
                    },
                  }}
                  sx={{
                    color: "white",
                    fontSize: "1.5rem",
                    fontWeight: "600",
                    height: "40px", // Fixed height
                    "& .MuiSelect-icon": {
                      color: "white",
                    },
                  }}
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                    <MenuItem key={num} value={num}>
                      {num} {num === 1 ? "Passenger" : "Passengers"}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </Box>
        </Box>

        {/* Search Button Section */}
        <Box sx={{ p: 3, display: "flex", justifyContent: "flex-end" }}>
          <Button
            type="submit"
            variant="contained"
            size="large"
            disableElevation
            disabled={loading || !!error}
            sx={{
              px: 6,
              py: 1.5,
              backgroundColor: "#e51937", // Delta red
              "&:hover": {
                backgroundColor: "#c0142e", // Darker red on hover
              },
              borderRadius: 0,
              fontWeight: "bold",
              fontSize: "1rem",
            }}
          >
            SEARCH
          </Button>
        </Box>
      </Box>
    </Paper>
  );
};

export default FlightSearchForm;
