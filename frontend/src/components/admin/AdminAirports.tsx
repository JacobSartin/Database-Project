import React, { useState, useEffect, useCallback } from "react";
import {
  Typography,
  Container,
  Box,
  Paper,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  InputAdornment,
  IconButton,
  CircularProgress,
  Alert,
  Pagination,
  Stack,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  SelectChangeEvent,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import FlightTakeoffIcon from "@mui/icons-material/FlightTakeoff";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  getAirports,
  createAirport,
  updateAirport,
  deleteAirport,
} from "../../services/adminApi";
import { AirportResponse } from "../../../../backend/src/types/requestTypes";

const AdminAirports: React.FC = () => {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [airports, setAirports] = useState<AirportResponse[]>([]);
  const [filteredAirports, setFilteredAirports] = useState<AirportResponse[]>(
    []
  );

  // Pagination state
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalAirports, setTotalAirports] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Search filters
  const [searchTerm, setSearchTerm] = useState("");

  // Dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedAirport, setSelectedAirport] =
    useState<AirportResponse | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [airportForm, setAirportForm] = useState<{
    AirportID: number;
    Code: string;
    Name: string;
    City: string;
    Country: string;
  }>({
    AirportID: 0,
    Code: "",
    Name: "",
    City: "",
    Country: "",
  });

  // Define applyFilters using useCallback to avoid dependency cycle
  const applyFilters = useCallback(
    (airportList: AirportResponse[], search: string) => {
      let result = [...airportList];

      // Apply search term filter
      if (search.trim() !== "") {
        const searchLower = search.toLowerCase();
        result = result.filter(
          (airport) =>
            airport.Code.toLowerCase().includes(searchLower) ||
            airport.Name.toLowerCase().includes(searchLower) ||
            airport.City.toLowerCase().includes(searchLower) ||
            airport.Country.toLowerCase().includes(searchLower)
        );
      }

      setFilteredAirports(result);
      setTotalPages(Math.ceil(result.length / pageSize));
      setTotalAirports(result.length);

      // Reset to first page when filters change
      setPage(1);
    },
    [pageSize]
  );

  useEffect(() => {
    // Check if user is admin
    if (!isAdmin) {
      navigate("/");
      return;
    }

    // Fetch airports data
    const fetchAirports = async () => {
      setLoading(true);
      try {
        const airportsData = await getAirports();
        setAirports(airportsData);
        setTotalAirports(airportsData.length);
        setTotalPages(Math.ceil(airportsData.length / pageSize));

        // Apply initial filters
        applyFilters(airportsData, searchTerm);
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
        console.error("Error fetching airports data:", err);
        setAirports([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAirports();
  }, [isAdmin, navigate, pageSize, searchTerm, applyFilters]);

  // Apply filters when search term changes
  useEffect(() => {
    applyFilters(airports, searchTerm);
  }, [searchTerm, airports, applyFilters]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handlePageChange = (
    _event: React.ChangeEvent<unknown>,
    value: number
  ) => {
    setPage(value);
  };

  const handlePageSizeChange = (event: SelectChangeEvent<number>) => {
    const newSize = Number(event.target.value);
    setPageSize(newSize);
    setTotalPages(Math.ceil(filteredAirports.length / newSize));
    setPage(1);
  };

  const handleEditClick = (airport: AirportResponse) => {
    setSelectedAirport(airport);
    setAirportForm(airport);
    setEditDialogOpen(true);
  };

  const handleDeleteClick = (airport: AirportResponse) => {
    setSelectedAirport(airport);
    setDeleteDialogOpen(true);
  };

  const handleAddNew = () => {
    setSelectedAirport(null);
    setAirportForm({
      AirportID: 0,
      Code: "",
      Name: "",
      City: "",
      Country: "",
    });
    setEditDialogOpen(true);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setAirportForm({
      ...airportForm,
      [name]: value,
    });
  };

  const confirmSaveAirport = async () => {
    try {
      if (
        !airportForm.Code ||
        !airportForm.Name ||
        !airportForm.City ||
        !airportForm.Country
      ) {
        setError("Please fill out all required fields");
        return;
      }

      const airportData = {
        Code: airportForm.Code.toUpperCase(),
        Name: airportForm.Name,
        City: airportForm.City,
        Country: airportForm.Country,
      };

      if (selectedAirport) {
        // Update existing airport
        await updateAirport(selectedAirport.AirportID, airportData);
      } else {
        // Add new airport
        await createAirport(airportData);
      }

      // Refresh the airports list
      const updatedAirports = await getAirports();
      setAirports(updatedAirports);
      setTotalAirports(updatedAirports.length);
      setTotalPages(Math.ceil(updatedAirports.length / pageSize));

      setEditDialogOpen(false);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  const confirmDeleteAirport = async () => {
    if (!selectedAirport) return;

    try {
      await deleteAirport(selectedAirport.AirportID);

      // Refresh the airports list
      const updatedAirports = await getAirports();
      setAirports(updatedAirports);
      setTotalAirports(updatedAirports.length);
      setTotalPages(Math.ceil(updatedAirports.length / pageSize));

      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setDeleteDialogOpen(false);
      setSelectedAirport(null);
    }
  };

  // Calculate pagination
  const startIndex = (page - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, filteredAirports.length);
  const paginatedAirports = filteredAirports.slice(startIndex, endIndex);

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 6, textAlign: "center" }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading airports data...
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Box
        sx={{
          mb: 4,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <Box>
          <Typography
            variant="h4"
            component="h1"
            gutterBottom
            sx={{ fontWeight: "bold" }}
          >
            Airport Management
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            View and manage airports in the system
          </Typography>
        </Box>
        <Button
          variant="contained"
          color="primary"
          startIcon={<FlightTakeoffIcon />}
          onClick={handleAddNew}
        >
          Add New Airport
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Filters */}
      <Paper elevation={1} sx={{ p: 3, mb: 4 }}>
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 2,
            alignItems: "center",
          }}
        >
          <TextField
            label="Search Airports"
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={handleSearchChange}
            sx={{ flexGrow: 1, minWidth: "200px" }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            placeholder="Search by code, name, city, or country"
          />
        </Box>
      </Paper>

      {/* Airports Table */}
      {filteredAirports.length === 0 ? (
        <Paper elevation={1} sx={{ p: 4, textAlign: "center" }}>
          <Typography variant="h6" color="text.secondary">
            No airports found matching your criteria
          </Typography>
        </Paper>
      ) : (
        <>
          <TableContainer component={Paper} sx={{ mb: 4 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Code</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>City</TableCell>
                  <TableCell>Country</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedAirports.map((airport) => (
                  <TableRow key={airport.AirportID}>
                    <TableCell>{airport.AirportID}</TableCell>
                    <TableCell>{airport.Code}</TableCell>
                    <TableCell>{airport.Name}</TableCell>
                    <TableCell>{airport.City}</TableCell>
                    <TableCell>{airport.Country}</TableCell>
                    <TableCell>
                      <Box sx={{ display: "flex", gap: 1 }}>
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleEditClick(airport)}
                          title="Edit Airport"
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDeleteClick(airport)}
                          title="Delete Airport"
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination controls */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography variant="body2" color="text.secondary">
              Showing {startIndex + 1}-{endIndex} of {totalAirports} airports
            </Typography>

            <Stack direction="row" spacing={2} alignItems="center">
              <FormControl variant="standard" sx={{ minWidth: 120 }}>
                <InputLabel id="page-size-select-label">
                  Rows per page
                </InputLabel>
                <Select
                  labelId="page-size-select-label"
                  value={pageSize}
                  onChange={handlePageSizeChange}
                  label="Rows per page"
                >
                  <MenuItem value={5}>5</MenuItem>
                  <MenuItem value={10}>10</MenuItem>
                  <MenuItem value={25}>25</MenuItem>
                  <MenuItem value={50}>50</MenuItem>
                </Select>
              </FormControl>

              <Pagination
                count={totalPages}
                page={page}
                onChange={handlePageChange}
                color="primary"
                showFirstButton
                showLastButton
              />
            </Stack>
          </Box>
        </>
      )}

      {/* Edit/Add Airport Dialog */}
      <Dialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {selectedAirport ? "Edit Airport" : "Add New Airport"}
        </DialogTitle>
        <DialogContent>
          <Box
            component="form"
            sx={{ mt: 1, display: "flex", flexDirection: "column", gap: 2 }}
          >
            <TextField
              label="Airport Code"
              name="Code"
              value={airportForm.Code}
              onChange={handleInputChange}
              fullWidth
              required
              margin="normal"
              inputProps={{
                maxLength: 3,
                style: { textTransform: "uppercase" },
              }}
              helperText="3-letter IATA airport code (e.g., LAX)"
            />
            <TextField
              label="Airport Name"
              name="Name"
              value={airportForm.Name}
              onChange={handleInputChange}
              fullWidth
              required
              margin="normal"
            />
            <TextField
              label="City"
              name="City"
              value={airportForm.City}
              onChange={handleInputChange}
              fullWidth
              required
              margin="normal"
            />
            <TextField
              label="Country"
              name="Country"
              value={airportForm.Country}
              onChange={handleInputChange}
              fullWidth
              required
              margin="normal"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)} color="primary">
            Cancel
          </Button>
          <Button
            onClick={confirmSaveAirport}
            color="primary"
            variant="contained"
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Airport</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the airport {selectedAirport?.Code}{" "}
            - {selectedAirport?.Name}? This action cannot be undone and may
            affect existing flights.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={confirmDeleteAirport} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminAirports;
