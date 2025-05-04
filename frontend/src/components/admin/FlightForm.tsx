import React, { useState, useEffect } from "react";
import {
  Typography,
  Container,
  Box,
  Paper,
  Button,
  TextField,
  Grid,
  CircularProgress,
  Alert,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  SelectChangeEvent,
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

// Define interfaces for the dropdowns
interface Airport {
  AirportID: number;
  Code: string;
  City: string;
  Country: string;
}

interface Aircraft {
  AircraftID: number;
  Model: string;
  Registration: string;
}

// Define a custom flight interface for the form
interface FlightFormData {
  OriginAirportID: number | null;
  DestinationAirportID: number | null;
  AircraftID: number | null;
  DepartureTime: string;
  ArrivalTime: string;
  BasePrice: number;
}

const FlightForm: React.FC = () => {
  const { flightId } = useParams<{ flightId: string }>();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form state
  const [flight, setFlight] = useState<FlightFormData>({
    OriginAirportID: null,
    DestinationAirportID: null,
    AircraftID: null,
    DepartureTime: new Date().toISOString().slice(0, 16),
    ArrivalTime: new Date(Date.now() + 3600000).toISOString().slice(0, 16),
    BasePrice: 0,
  });

  // Options for dropdowns
  const [airports, setAirports] = useState<Airport[]>([]);
  const [aircraft, setAircraft] = useState<Aircraft[]>([]);

  const isEditMode = !!flightId;

  useEffect(() => {
    // Check if user is admin
    if (!isAdmin) {
      navigate("/");
      return;
    }

    // Fetch data for dropdowns
    const fetchOptions = async () => {
      try {
        // Fetch airports
        const airportsResponse = await fetch(
          "http://localhost:5000/api/airports",
          {
            credentials: "include",
          }
        );
        if (airportsResponse.ok) {
          const airportsData = await airportsResponse.json();
          setAirports(airportsData.data || []);
        }

        // Fetch aircraft
        const aircraftResponse = await fetch(
          "http://localhost:5000/api/admin/aircraft",
          {
            credentials: "include",
          }
        );
        if (aircraftResponse.ok) {
          const aircraftData = await aircraftResponse.json();
          setAircraft(aircraftData.data || []);
        }
      } catch (err) {
        console.error("Error fetching options:", err);
        setError("Failed to load form options. Please try again.");
      }
    };

    // If in edit mode, fetch the flight details
    const fetchFlight = async () => {
      try {
        const response = await fetch(
          `http://localhost:5000/api/flights/${flightId}`,
          {
            credentials: "include",
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        if (data.data) {
          // Format dates for datetime-local input
          const departureTime = new Date(data.data.DepartureTime);
          const arrivalTime = new Date(data.data.ArrivalTime);

          setFlight({
            OriginAirportID: data.data.OriginAirportID,
            DestinationAirportID: data.data.DestinationAirportID,
            AircraftID: data.data.AircraftID,
            DepartureTime: departureTime.toISOString().slice(0, 16),
            ArrivalTime: arrivalTime.toISOString().slice(0, 16),
            BasePrice: data.data.BasePrice || 0,
          });
        }
      } catch (err) {
        console.error("Error fetching flight:", err);
        setError("Failed to load flight details. Please try again.");
      }
    };

    const loadData = async () => {
      setLoading(true);
      await fetchOptions();

      if (isEditMode) {
        await fetchFlight();
      }

      setLoading(false);
    };

    loadData();
  }, [isAdmin, navigate, flightId, isEditMode]);

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFlight({ ...flight, [name]: value });
  };

  const handleSelectChange = (e: SelectChangeEvent<number | null>) => {
    const { name, value } = e.target;
    setFlight({ ...flight, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const url = isEditMode
        ? `http://localhost:5000/api/admin/flights/${flightId}`
        : "http://localhost:5000/api/admin/flights";

      const method = isEditMode ? "PUT" : "POST";

      // Prepare payload data for API
      const payload = {
        ...flight,
        // Convert to proper format for backend
        DepartureTime: new Date(flight.DepartureTime),
        ArrivalTime: new Date(flight.ArrivalTime),
      };

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      setSuccess(
        isEditMode
          ? "Flight updated successfully!"
          : "Flight created successfully!"
      );

      // After 2 seconds, navigate back to the flights list
      setTimeout(() => {
        navigate("/admin/flights");
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      console.error("Error saving flight:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate("/admin/flights");
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 6, textAlign: "center" }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading form...
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Paper elevation={2} sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: "bold" }}>
          {isEditMode ? "Edit Flight" : "Add New Flight"}
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {success}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} noValidate>
          <Grid container spacing={3}>
            <Grid
              sx={{
                width: { xs: "100%", sm: "50%" },
              }}
            >
              <FormControl fullWidth variant="outlined">
                <InputLabel id="origin-airport-label">
                  Origin Airport
                </InputLabel>
                <Select
                  labelId="origin-airport-label"
                  name="OriginAirportID"
                  value={flight.OriginAirportID}
                  onChange={handleSelectChange}
                  label="Origin Airport"
                  required
                >
                  {airports.map((airport) => (
                    <MenuItem key={airport.AirportID} value={airport.AirportID}>
                      {airport.Code} - {airport.City}, {airport.Country}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid
              sx={{
                width: { xs: "100%", sm: "50%" },
              }}
            >
              <FormControl fullWidth variant="outlined">
                <InputLabel id="destination-airport-label">
                  Destination Airport
                </InputLabel>
                <Select
                  labelId="destination-airport-label"
                  name="DestinationAirportID"
                  value={flight.DestinationAirportID}
                  onChange={handleSelectChange}
                  label="Destination Airport"
                  required
                >
                  {airports.map((airport) => (
                    <MenuItem key={airport.AirportID} value={airport.AirportID}>
                      {airport.Code} - {airport.City}, {airport.Country}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid
              sx={{
                width: { xs: "100%", sm: "50%" },
              }}
            >
              <FormControl fullWidth variant="outlined">
                <InputLabel id="aircraft-label">Aircraft</InputLabel>
                <Select
                  labelId="aircraft-label"
                  name="AircraftID"
                  value={flight.AircraftID}
                  onChange={handleSelectChange}
                  label="Aircraft"
                  required
                >
                  {aircraft.map((plane) => (
                    <MenuItem key={plane.AircraftID} value={plane.AircraftID}>
                      {plane.Model} ({plane.Registration})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid
              sx={{
                width: { xs: "100%", sm: "50%" },
              }}
            >
              <TextField
                fullWidth
                name="BasePrice"
                label="Base Price ($)"
                type="number"
                value={flight.BasePrice}
                onChange={handleTextChange}
                InputProps={{ inputProps: { min: 0, step: 0.01 } }}
                required
              />
            </Grid>

            <Grid
              sx={{
                width: { xs: "100%", sm: "50%" },
              }}
            >
              <TextField
                fullWidth
                name="DepartureTime"
                label="Departure Time"
                type="datetime-local"
                value={flight.DepartureTime}
                onChange={handleTextChange}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>

            <Grid
              sx={{
                width: { xs: "100%", sm: "50%" },
              }}
            >
              <TextField
                fullWidth
                name="ArrivalTime"
                label="Arrival Time"
                type="datetime-local"
                value={flight.ArrivalTime}
                onChange={handleTextChange}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>

            <Grid sx={{ width: "100%", mt: 2 }}>
              <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
                <Button
                  variant="outlined"
                  onClick={handleCancel}
                  disabled={saving}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={saving}
                  startIcon={saving ? <CircularProgress size={20} /> : null}
                >
                  {saving
                    ? "Saving..."
                    : isEditMode
                      ? "Update Flight"
                      : "Create Flight"}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Container>
  );
};

export default FlightForm;
