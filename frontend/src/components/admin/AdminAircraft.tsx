import React, { useState, useEffect } from "react";
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
import AirlinesIcon from "@mui/icons-material/Airlines";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  getAdminAircraft,
  createAircraft,
  updateAircraft,
  deleteAircraft,
} from "../../services/adminApi";
import { AircraftResponse } from "../../../../backend/src/types/requestTypes";

const AdminAircraft: React.FC = () => {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [aircraft, setAircraft] = useState<AircraftResponse[]>([]);

  // Pagination state
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalAircraft, setTotalAircraft] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Search state
  const [searchTerm, setSearchTerm] = useState("");
  const [searchDebounce, setSearchDebounce] = useState("");

  // Dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedAircraft, setSelectedAircraft] =
    useState<AircraftResponse | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [aircraftForm, setAircraftForm] = useState<AircraftResponse>({
    AircraftID: 0,
    Model: "",
    TotalSeats: 0,
  });

  // Debounce search term to avoid excessive API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm !== searchDebounce) {
        setSearchDebounce(searchTerm);
        setPage(1); // Reset to first page when search changes
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    // Check if user is admin
    if (!isAdmin) {
      navigate("/");
      return;
    }

    // Fetch aircraft data
    const fetchAircraft = async () => {
      setLoading(true);
      try {
        const formattedAircraft = await getAdminAircraft({
          page,
          pageSize,
          search: searchDebounce.trim() || undefined,
        });

        setAircraft(formattedAircraft.aircraft);
        setTotalAircraft(formattedAircraft.totalCount);
        setTotalPages(formattedAircraft.totalPages);
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
        console.error("Error fetching aircraft data:", err);
        setAircraft([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAircraft();
  }, [isAdmin, navigate, page, pageSize, searchDebounce]);

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
    setPage(1); // Reset to first page when changing page size
  };

  const handleEditClick = (aircraft: AircraftResponse) => {
    setSelectedAircraft(aircraft);
    setAircraftForm(aircraft);
    setEditDialogOpen(true);
  };

  const handleDeleteClick = (aircraft: AircraftResponse) => {
    setSelectedAircraft(aircraft);
    setDeleteDialogOpen(true);
  };

  const handleAddNew = () => {
    setSelectedAircraft(null);
    setAircraftForm({
      AircraftID: 0,
      Model: "",
      TotalSeats: 0,
    });
    setEditDialogOpen(true);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setAircraftForm({
      ...aircraftForm,
      [name]: name.includes("Seats") ? Number(value) : value,
    });
  };

  const confirmSaveAircraft = async () => {
    try {
      if (!aircraftForm.Model || aircraftForm.TotalSeats <= 0) {
        setError("Please fill out all required fields");
        return;
      }

      const aircraftData = {
        Model: aircraftForm.Model,
        TotalSeats: aircraftForm.TotalSeats,
      };

      if (selectedAircraft) {
        // Update existing aircraft
        await updateAircraft(selectedAircraft.AircraftID, aircraftData);
      } else {
        // Add new aircraft
        await createAircraft(aircraftData);
      }

      // Refresh the aircraft list
      const formattedAircraft = await getAdminAircraft({
        page,
        pageSize,
        search: searchDebounce.trim() || undefined,
      });

      setAircraft(formattedAircraft.aircraft);
      setTotalAircraft(formattedAircraft.totalCount);
      setTotalPages(formattedAircraft.totalPages);
      setEditDialogOpen(false);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  const confirmDeleteAircraft = async () => {
    if (!selectedAircraft) return;

    try {
      await deleteAircraft(selectedAircraft.AircraftID);

      // Refresh the aircraft list
      const formattedAircraft = await getAdminAircraft({
        page,
        pageSize,
        search: searchDebounce.trim() || undefined,
      });

      setAircraft(formattedAircraft.aircraft);
      setTotalAircraft(formattedAircraft.totalCount);
      setTotalPages(formattedAircraft.totalPages);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setDeleteDialogOpen(false);
      setSelectedAircraft(null);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 6, textAlign: "center" }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading aircraft data...
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
            Aircraft Management
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            View and manage your fleet of aircraft
          </Typography>
        </Box>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AirlinesIcon />}
          onClick={handleAddNew}
        >
          Add New Aircraft
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
            label="Search Aircraft"
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
            placeholder="Search by model"
          />
        </Box>
      </Paper>

      {/* Aircraft Table */}
      {aircraft.length === 0 ? (
        <Paper elevation={1} sx={{ p: 4, textAlign: "center" }}>
          <Typography variant="h6" color="text.secondary">
            No aircraft found matching your criteria
          </Typography>
        </Paper>
      ) : (
        <>
          <TableContainer component={Paper} sx={{ mb: 4 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Model</TableCell>
                  <TableCell>Total Seats</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {aircraft.map((aircraft) => (
                  <TableRow key={aircraft.AircraftID}>
                    <TableCell>{aircraft.AircraftID}</TableCell>
                    <TableCell>{aircraft.Model}</TableCell>
                    <TableCell>{aircraft.TotalSeats}</TableCell>
                    <TableCell>
                      <Box sx={{ display: "flex", gap: 1 }}>
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleEditClick(aircraft)}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDeleteClick(aircraft)}
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
              Showing {aircraft.length > 0 ? (page - 1) * pageSize + 1 : 0}-
              {Math.min(page * pageSize, totalAircraft)} of {totalAircraft}{" "}
              aircraft
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

      {/* Edit/Add Aircraft Dialog */}
      <Dialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {selectedAircraft ? "Edit Aircraft" : "Add New Aircraft"}
        </DialogTitle>
        <DialogContent>
          <Box
            component="form"
            sx={{ mt: 1, display: "flex", flexDirection: "column", gap: 2 }}
          >
            <TextField
              label="Model"
              name="Model"
              value={aircraftForm.Model}
              onChange={handleInputChange}
              fullWidth
              required
              margin="normal"
            />
            <TextField
              label="Total Seats"
              name="TotalSeats"
              type="number"
              value={aircraftForm.TotalSeats}
              onChange={handleInputChange}
              fullWidth
              required
              margin="normal"
              InputProps={{ inputProps: { min: 1 } }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)} color="primary">
            Cancel
          </Button>
          <Button
            onClick={confirmSaveAircraft}
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
        <DialogTitle>Delete Aircraft</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the aircraft{" "}
            {selectedAircraft?.Model}? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={confirmDeleteAircraft} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminAircraft;
