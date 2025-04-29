import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Button,
  Typography,
  Grid,
  MenuItem,
  Select,
  InputLabel,
  SelectChangeEvent,
  TextField,
  Autocomplete,
  Paper,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { AirportOption } from "../types/flightTypes";
import Fuse from "fuse.js";

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
    sourceAirport: AirportOption,
    destinationAirport: AirportOption,
    departureDate: Date | null,
    returnDate: Date | null,
    passengerCount: number,
    tripType: string
  ) => void;
};

const FlightSearchForm: React.FC<FlightSearchFormProps> = ({ onSearch }) => {
  const [sourceAirport, setSourceAirport] = useState<AirportOption | null>(
    null
  );
  const [destinationAirport, setDestinationAirport] =
    useState<AirportOption | null>(null);
  const [departureDate, setDepartureDate] = useState<Date | null>(null);
  const [returnDate, setReturnDate] = useState<Date | null>(null);
  const [tripType, setTripType] = useState<"oneWay" | "roundTrip">("oneWay");
  const [passengerCount, setPassengerCount] = useState<number>(1);
  const [airportOptions, setAirportOptions] = useState<AirportOption[]>([]);

  // Current date for min date on date pickers
  const today = new Date();

  // Load airports on component mount
  useEffect(() => {
    // In a real app, this would be an API call to fetch airports from your backend
    fetchAirports();
  }, []);

  // Fetch airports from the backend
  const fetchAirports = async () => {
    try {
      // This would be replaced with an actual API call
      // For now, we'll use sample data based on your database
      const airports: AirportOption[] = [
        {
          value: "JFK",
          label: "New York - JFK (John F. Kennedy International Airport)",
          airportId: 1,
        },
        {
          value: "LAX",
          label: "Los Angeles - LAX (Los Angeles International Airport)",
          airportId: 2,
        },
        {
          value: "LHR",
          label: "London - LHR (London Heathrow Airport)",
          airportId: 3,
        },
        {
          value: "CDG",
          label: "Paris - CDG (Charles de Gaulle Airport)",
          airportId: 4,
        },
        { value: "HND", label: "Tokyo - HND (Haneda Airport)", airportId: 5 },
        { value: "SYD", label: "Sydney - SYD (Sydney Airport)", airportId: 6 },
        {
          value: "DXB",
          label: "Dubai - DXB (Dubai International Airport)",
          airportId: 7,
        },
        {
          value: "SIN",
          label: "Singapore - SIN (Singapore Changi Airport)",
          airportId: 8,
        },
        {
          value: "AMS",
          label: "Amsterdam - AMS (Schiphol Airport)",
          airportId: 9,
        },
        {
          value: "FRA",
          label: "Frankfurt - FRA (Frankfurt Airport)",
          airportId: 10,
        },
        {
          value: "MAD",
          label: "Madrid - MAD (Adolfo Suárez Madrid–Barajas Airport)",
          airportId: 11,
        },
        {
          value: "FCO",
          label: "Rome - FCO (Leonardo da Vinci–Fiumicino Airport)",
          airportId: 12,
        },
        {
          value: "YYZ",
          label: "Toronto - YYZ (Toronto Pearson International Airport)",
          airportId: 13,
        },
        {
          value: "PEK",
          label: "Beijing - PEK (Beijing Capital International Airport)",
          airportId: 14,
        },
        {
          value: "ICN",
          label: "Seoul - ICN (Incheon International Airport)",
          airportId: 15,
        },
      ];

      setAirportOptions(airports);
    } catch (error) {
      console.error("Error fetching airports:", error);
    }
  };

  // Create Fuse instance for fuzzy search
  const fuse = useMemo(
    () => new Fuse(airportOptions, fuseOptions),
    [airportOptions]
  );

  // Handle form submission to search for flights
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    if (!sourceAirport || !destinationAirport || !departureDate) {
      alert("Please fill in all required fields");
      return;
    }

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

  return (
    <Paper
      elevation={1}
      sx={{
        border: "1px solid #e0e0e0",
        borderRadius: 2,
        p: 3,
        mb: 3,
        width: "100%",
        boxSizing: "border-box",
      }}
    >
      <Typography variant="h5" gutterBottom component="h2">
        Book a Flight
      </Typography>

      <Box
        component="form"
        onSubmit={handleSearch}
        noValidate
        sx={{ width: "100%" }}
      >
        <FormControl component="fieldset" sx={{ mb: 2, width: "100%" }}>
          <FormLabel component="legend">Trip Type</FormLabel>
          <RadioGroup
            row
            name="tripType"
            value={tripType}
            onChange={handleTripTypeChange}
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

        <Grid container spacing={3}>
          <Grid>
            <Autocomplete
              id="source-airport"
              options={airportOptions}
              getOptionLabel={(option) => option.label}
              value={sourceAirport}
              onChange={(_, newValue) => {
                setSourceAirport(newValue);
              }}
              filterOptions={(options, state) => {
                if (!state.inputValue) return options;
                const results = fuse.search(state.inputValue);
                return results.map((result) => result.item);
              }}
              renderInput={(params) => (
                <TextField {...params} label="From" required fullWidth />
              )}
            />
          </Grid>

          <Grid>
            <Autocomplete
              id="destination-airport"
              options={airportOptions}
              getOptionLabel={(option) => option.label}
              value={destinationAirport}
              onChange={(_, newValue) => {
                setDestinationAirport(newValue);
              }}
              filterOptions={(options, state) => {
                if (!state.inputValue) return options;
                const results = fuse.search(state.inputValue);
                return results.map((result) => result.item);
              }}
              renderInput={(params) => (
                <TextField {...params} label="To" required fullWidth />
              )}
            />
          </Grid>

          {/* This grid layout always ensures the same form width regardless of trip type */}
          <Grid container spacing={3}>
            <Grid>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Departure Date"
                  value={departureDate}
                  onChange={(newValue) => setDepartureDate(newValue)}
                  disablePast
                  slotProps={{
                    textField: {
                      required: true,
                      fullWidth: true,
                    },
                  }}
                />
              </LocalizationProvider>
            </Grid>

            <Grid
              sx={{
                display: tripType === "roundTrip" ? "block" : "none",
                // Keep the space even when hidden to prevent layout shift
                visibility: tripType === "roundTrip" ? "visible" : "hidden",
              }}
            >
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Return Date"
                  value={returnDate}
                  onChange={(newValue) => setReturnDate(newValue)}
                  disablePast
                  minDate={departureDate || today}
                  slotProps={{
                    textField: {
                      required: tripType === "roundTrip",
                      fullWidth: true,
                    },
                  }}
                />
              </LocalizationProvider>
            </Grid>

            <Grid>
              <FormControl fullWidth>
                <InputLabel id="passenger-count-label">Passengers</InputLabel>
                <Select
                  labelId="passenger-count-label"
                  id="passenger-count"
                  value={passengerCount}
                  label="Passengers"
                  onChange={handlePassengerChange}
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                    <MenuItem key={num} value={num}>
                      {num}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Grid>

        <Box sx={{ mt: 3 }}>
          <Button
            type="submit"
            variant="contained"
            size="large"
            fullWidth
            disableElevation
          >
            Search Flights
          </Button>
        </Box>
      </Box>
    </Paper>
  );
};

export default FlightSearchForm;
