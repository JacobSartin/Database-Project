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
  CircularProgress,
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Pagination,
  Stack,
  TextField,
  InputAdornment,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  SelectChangeEvent,
  Chip,
  Switch,
  FormControlLabel,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import EmailIcon from "@mui/icons-material/Email";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  getAdminUsers,
  createUser,
  updateUser,
  deleteUser,
  resetUserPassword,
} from "../../services/adminApi";
import { UserResponse } from "../../../../backend/src/types/requestTypes";

const AdminUsers: React.FC = () => {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState<UserResponse[]>([]);

  // Pagination state
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Search and filters
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [searchDebounce, setSearchDebounce] = useState("");

  // Dialog states
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserResponse | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [passwordResetDialogOpen, setPasswordResetDialogOpen] = useState(false);
  const [userForm, setUserForm] = useState<Partial<UserResponse>>({
    FirstName: "",
    LastName: "",
    Email: "",
    isAdmin: false,
    Password: "",
  });

  useEffect(() => {
    // Check if user is admin
    if (!isAdmin) {
      navigate("/");
      return;
    }

    // Fetch users data
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const formattedUsers = await getAdminUsers({
          page,
          pageSize,
          search: searchDebounce.trim() || undefined,
          role: roleFilter !== "all" ? roleFilter : undefined,
        });

        setUsers(formattedUsers.users);
        setTotalUsers(formattedUsers.totalCount);
        setTotalPages(formattedUsers.totalPages);
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
        console.error("Error fetching users data:", err);
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [isAdmin, navigate, page, pageSize, searchDebounce, roleFilter]);

  // Debounce search term to avoid excessive rerenders
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchDebounce(searchTerm);
      setPage(1); // Reset to first page when search changes
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Apply client-side filters for the current page of data
  const filteredUsers = users.filter((user) => {
    // Apply search term filter
    if (searchDebounce.trim() !== "") {
      const searchLower = searchDebounce.toLowerCase();
      const nameMatch =
        user.FirstName.toLowerCase().includes(searchLower) ||
        user.LastName.toLowerCase().includes(searchLower);
      const emailMatch = user.Email.toLowerCase().includes(searchLower);

      if (!nameMatch && !emailMatch) {
        return false;
      }
    }

    // Apply role filter
    if (roleFilter !== "all") {
      const isAdmin = roleFilter === "admin";
      if (user.isAdmin !== isAdmin) {
        return false;
      }
    }

    return true;
  });

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    // When changing search, we stay on the current page since we're just filtering the current data
  };

  const handleRoleFilterChange = (event: SelectChangeEvent<string>) => {
    setRoleFilter(event.target.value);
    setPage(1); // Reset to first page when filter changes
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

  const handleEditClick = (user: UserResponse) => {
    setSelectedUser(user);
    setUserForm({
      FirstName: user.FirstName,
      LastName: user.LastName,
      Email: user.Email,
      isAdmin: user.isAdmin,
    });
    setEditDialogOpen(true);
  };

  const handleDeleteClick = (user: UserResponse) => {
    setSelectedUser(user);
    setDeleteDialogOpen(true);
  };

  const handlePasswordResetClick = (user: UserResponse) => {
    setSelectedUser(user);
    setPasswordResetDialogOpen(true);
  };

  const handleAddNewUser = () => {
    setSelectedUser(null);
    setUserForm({
      FirstName: "",
      LastName: "",
      Email: "",
      isAdmin: false,
    });
    setEditDialogOpen(true);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = event.target;
    setUserForm({
      ...userForm,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const confirmSaveUser = async () => {
    if (!userForm.FirstName || !userForm.LastName || !userForm.Email) {
      setError("First name, last name and email are required");
      return;
    }

    try {
      if (selectedUser) {
        // Update existing user
        await updateUser(selectedUser.UserID, userForm);
      } else {
        // Add new user with password for new users
        if (!userForm.Password) {
          setError("Password is required for new users");
          return;
        }

        await createUser({
          Username: userForm.Email!.split("@")[0], // Generate username from email
          Password: userForm.Password!,
          FirstName: userForm.FirstName!,
          LastName: userForm.LastName!,
          Email: userForm.Email!,
          IsAdmin: userForm.isAdmin || false,
        });
      }

      // Refresh the users list
      const formattedUsers = await getAdminUsers({
        page,
        pageSize,
        search: searchDebounce.trim() || undefined,
        role: roleFilter !== "all" ? roleFilter : undefined,
      });

      setUsers(formattedUsers.users);
      setTotalUsers(formattedUsers.totalCount);
      setTotalPages(formattedUsers.totalPages);
      setEditDialogOpen(false);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  const confirmDeleteUser = async () => {
    if (!selectedUser) return;

    try {
      await deleteUser(selectedUser.UserID);

      // Refresh the users list
      const formattedUsers = await getAdminUsers({
        page,
        pageSize,
        search: searchDebounce.trim() || undefined,
        role: roleFilter !== "all" ? roleFilter : undefined,
      });

      setUsers(formattedUsers.users);
      setTotalUsers(formattedUsers.totalCount);
      setTotalPages(formattedUsers.totalPages);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setDeleteDialogOpen(false);
      setSelectedUser(null);
    }
  };

  const confirmPasswordReset = async () => {
    if (!selectedUser || !userForm.Password) return;

    try {
      await resetUserPassword(selectedUser.UserID, userForm.Password!);
      setError(null);
      // Show success notification
      alert("Password has been reset successfully");
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setPasswordResetDialogOpen(false);
      setSelectedUser(null);
    }
  };

  // Use filtered users for display
  const paginatedUsers = filteredUsers;

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 6, textAlign: "center" }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading user data...
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
            User Management
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Manage user accounts and permissions
          </Typography>
        </Box>
        <Button
          variant="contained"
          color="primary"
          startIcon={<PersonAddIcon />}
          onClick={handleAddNewUser}
        >
          Add New User
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
            label="Search Users"
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
            placeholder="Search by name, email"
          />

          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel id="role-filter-label">Role</InputLabel>
            <Select
              labelId="role-filter-label"
              value={roleFilter}
              label="Role"
              onChange={handleRoleFilterChange}
            >
              <MenuItem value="all">All Roles</MenuItem>
              <MenuItem value="admin">Admin</MenuItem>
              <MenuItem value="user">User</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Paper>

      {/* Users Table */}
      {filteredUsers.length === 0 ? (
        <Paper elevation={1} sx={{ p: 4, textAlign: "center" }}>
          <Typography variant="h6" color="text.secondary">
            No users found matching your criteria
          </Typography>
        </Paper>
      ) : (
        <>
          <TableContainer component={Paper} sx={{ mb: 4 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Reservations</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedUsers.map((user) => (
                  <TableRow key={user.UserID}>
                    <TableCell>{user.UserID}</TableCell>
                    <TableCell>{`${user.FirstName} ${user.LastName}`}</TableCell>
                    <TableCell>{user.Email}</TableCell>
                    <TableCell>
                      <Chip
                        label={user.isAdmin ? "Admin" : "User"}
                        color={user.isAdmin ? "primary" : "default"}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{user.ReservationCount || 0}</TableCell>
                    <TableCell>
                      <Box sx={{ display: "flex", gap: 1 }}>
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleEditClick(user)}
                          title="Edit User"
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="info"
                          onClick={() => handlePasswordResetClick(user)}
                          title="Reset Password"
                        >
                          <LockOpenIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="info"
                          onClick={() =>
                            (window.location.href = `mailto:${user.Email}`)
                          }
                          title="Email User"
                        >
                          <EmailIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDeleteClick(user)}
                          title="Delete User"
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
              Showing {(page - 1) * pageSize + 1}-
              {Math.min(page * pageSize, totalUsers)} of {totalUsers} users
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

      {/* Edit/Add User Dialog */}
      <Dialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>{selectedUser ? "Edit User" : "Add New User"}</DialogTitle>
        <DialogContent>
          <Box
            component="form"
            sx={{ mt: 1, display: "flex", flexDirection: "column", gap: 2 }}
          >
            <TextField
              label="First Name"
              name="FirstName"
              value={userForm.FirstName}
              onChange={handleInputChange}
              fullWidth
              required
              margin="normal"
            />
            <TextField
              label="Last Name"
              name="LastName"
              value={userForm.LastName}
              onChange={handleInputChange}
              fullWidth
              required
              margin="normal"
            />
            <TextField
              label="Email"
              name="Email"
              type="email"
              value={userForm.Email}
              onChange={handleInputChange}
              fullWidth
              required
              margin="normal"
            />
            {/* Only show password field when adding a new user */}
            {!selectedUser && (
              <TextField
                label="Password"
                name="Password"
                type="password"
                value={userForm.Password || ""}
                onChange={handleInputChange}
                fullWidth
                required
                margin="normal"
              />
            )}
            <FormControlLabel
              control={
                <Switch
                  checked={userForm.isAdmin}
                  onChange={handleInputChange}
                  name="IsAdmin"
                  color="primary"
                />
              }
              label="Admin Privileges"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={confirmSaveUser} color="primary" variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete User</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the user {selectedUser?.FirstName}{" "}
            {selectedUser?.LastName}? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={confirmDeleteUser} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Password Reset Dialog */}
      <Dialog
        open={passwordResetDialogOpen}
        onClose={() => setPasswordResetDialogOpen(false)}
      >
        <DialogTitle>Reset Password</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Enter a new password for {selectedUser?.FirstName}{" "}
            {selectedUser?.LastName}:
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            name="Password"
            label="New Password"
            type="password"
            fullWidth
            value={userForm.Password || ""}
            onChange={handleInputChange}
            required
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setPasswordResetDialogOpen(false)}
            color="primary"
          >
            Cancel
          </Button>
          <Button
            onClick={confirmPasswordReset}
            color="primary"
            variant="contained"
          >
            Reset Password
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminUsers;
