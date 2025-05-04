import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Menu,
  MenuItem,
  Avatar,
  IconButton,
  Stack,
} from "@mui/material";
import AirplanemodeActiveIcon from "@mui/icons-material/AirplanemodeActive";
import ConfirmationNumberIcon from "@mui/icons-material/ConfirmationNumber";
import HomeIcon from "@mui/icons-material/Home";
import SettingsIcon from "@mui/icons-material/Settings";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AuthModal from "./AuthModal";

interface TopBarProps {
  title?: string;
}

const TopBar: React.FC<TopBarProps> = ({ title = "SkyBooker Airlines" }) => {
  const { user, isAuthenticated, logout, isAdmin } = useAuth();
  const location = useLocation();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleUserMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setAnchorEl(null);
  };

  const handleOpenAuthModal = (mode: "login" | "register") => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

  const handleLogout = async () => {
    await logout();
    handleUserMenuClose();
  };

  // Style for active navigation link
  const getNavLinkStyle = (path: string) => ({
    color: "white",
    fontWeight: location.pathname === path ? "bold" : "normal",
    textDecoration: "none",
    display: "flex",
    alignItems: "center",
    borderBottom: location.pathname === path ? "2px solid white" : "none",
    paddingBottom: "3px",
    transition: "all 0.2s",
    "&:hover": {
      opacity: 0.8,
    },
  });

  return (
    <>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: "100%",
          top: 0,
          left: 0,
          zIndex: (theme) => theme.zIndex.drawer + 1,
        }}
      >
        <Toolbar>
          <AirplanemodeActiveIcon sx={{ mr: 2 }} />
          <Typography
            variant="h6"
            component="div"
            sx={{
              flexGrow: { xs: 0, md: 1 },
              mr: { xs: 2, md: 0 },
            }}
          >
            {title}
          </Typography>

          {/* Navigation Links */}
          <Stack
            direction="row"
            spacing={3}
            sx={{
              display: { xs: "none", md: "flex" },
              flexGrow: 1,
            }}
          >
            <Box component={Link} to="/" sx={getNavLinkStyle("/")}>
              <HomeIcon sx={{ mr: 0.5 }} fontSize="small" />
              Book Flights
            </Box>
            <Box
              component={Link}
              to="/bookings"
              sx={getNavLinkStyle("/bookings")}
            >
              <ConfirmationNumberIcon sx={{ mr: 0.5 }} fontSize="small" />
              My Bookings
            </Box>

            {/* Admin Links - only shown to admin users */}
            {isAdmin && (
              <Box component={Link} to="/admin" sx={getNavLinkStyle("/admin")}>
                <SettingsIcon sx={{ mr: 0.5 }} fontSize="small" />
                Admin Dashboard
              </Box>
            )}
          </Stack>

          {isAuthenticated ? (
            <Box sx={{ display: "flex", alignItems: "center" }}>
              {/* Mobile nav links in user menu */}
              <Box sx={{ display: { xs: "block", md: "none" } }}>
                <Button
                  component={Link}
                  to="/bookings"
                  color="inherit"
                  sx={{ mr: 1 }}
                  startIcon={<ConfirmationNumberIcon />}
                >
                  Bookings
                </Button>
              </Box>

              <IconButton
                onClick={handleUserMenuOpen}
                size="small"
                sx={{ ml: 2 }}
                aria-controls="user-menu"
                aria-haspopup="true"
              >
                <Avatar sx={{ width: 32, height: 32, bgcolor: "primary.main" }}>
                  {user?.FirstName?.charAt(0) ||
                    user?.Email?.charAt(0).toUpperCase()}
                </Avatar>
              </IconButton>
              <Menu
                id="user-menu"
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleUserMenuClose}
                anchorOrigin={{
                  vertical: "bottom",
                  horizontal: "right",
                }}
                transformOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
                PaperProps={{
                  sx: { backgroundColor: "#14161d" },
                }}
              >
                <MenuItem disabled>
                  <Typography variant="body2">
                    {user?.FirstName} {user?.LastName}
                  </Typography>
                </MenuItem>
                {/* Mobile only menu items */}
                <Box sx={{ display: { xs: "block", md: "none" } }}>
                  <MenuItem
                    component={Link}
                    to="/"
                    onClick={handleUserMenuClose}
                  >
                    Book Flights
                  </MenuItem>
                  <MenuItem
                    component={Link}
                    to="/bookings"
                    onClick={handleUserMenuClose}
                  >
                    My Bookings
                  </MenuItem>
                </Box>
                <MenuItem onClick={handleLogout}>Logout</MenuItem>
              </Menu>
            </Box>
          ) : (
            <Box>
              {/* For mobile, show bookings button when not authenticated too */}
              <Box sx={{ display: { xs: "block", md: "none" } }}>
                <Button
                  component={Link}
                  to="/bookings"
                  color="inherit"
                  sx={{ mr: 1 }}
                  startIcon={<ConfirmationNumberIcon />}
                >
                  Bookings
                </Button>
              </Box>

              <Button
                color="inherit"
                onClick={() => handleOpenAuthModal("login")}
                sx={{ mr: 1 }}
              >
                Sign In
              </Button>
              <Button
                variant="outlined"
                color="inherit"
                onClick={() => handleOpenAuthModal("register")}
              >
                Register
              </Button>
            </Box>
          )}
        </Toolbar>
      </AppBar>

      {/* Add spacing to avoid content being hidden behind the AppBar */}
      <Toolbar />

      {/* Authentication Modal */}
      <AuthModal
        open={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        mode={authMode}
      />
    </>
  );
};

export default TopBar;
