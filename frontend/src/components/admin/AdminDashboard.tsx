import React, { useState, useEffect } from "react";
import {
  Typography,
  Container,
  Box,
  Paper,
  Card,
  CardContent,
  CardActions,
  Button,
  Divider,
  CircularProgress,
  Alert,
} from "@mui/material";
import FlightIcon from "@mui/icons-material/Flight";
import AirlinesIcon from "@mui/icons-material/Airlines";
import AirplanemodeActiveIcon from "@mui/icons-material/AirplanemodeActive";
import PeopleIcon from "@mui/icons-material/People";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

interface DashboardStat {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  link?: string;
}

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<{
    totalFlights: number;
    totalUsers: number;
    totalAircraft: number;
    totalReservations: number;
  }>({
    totalFlights: 0,
    totalUsers: 0,
    totalAircraft: 0,
    totalReservations: 0,
  });

  useEffect(() => {
    // Check if user is admin
    if (!isAdmin) {
      navigate("/");
      return;
    }

    // Fetch dashboard statistics
    const fetchStats = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          "http://localhost:5000/api/admin/dashboard",
          {
            credentials: "include",
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        if (data.data) {
          setStats(data.data);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
        console.error("Error fetching dashboard data:", err);

        // Set fallback stats if API isn't available yet
        setStats({
          totalFlights: 54,
          totalUsers: 120,
          totalAircraft: 12,
          totalReservations: 234,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [isAdmin, navigate]);

  const dashboardStats: DashboardStat[] = [
    {
      title: "Total Flights",
      value: stats.totalFlights,
      icon: <FlightIcon fontSize="large" color="primary" />,
      link: "/admin/flights",
    },
    {
      title: "Total Users",
      value: stats.totalUsers,
      icon: <PeopleIcon fontSize="large" color="primary" />,
      link: "/admin/users",
    },
    {
      title: "Aircraft",
      value: stats.totalAircraft,
      icon: <AirlinesIcon fontSize="large" color="primary" />,
      link: "/admin/aircraft",
    },
    {
      title: "Reservations",
      value: stats.totalReservations,
      icon: <AirplanemodeActiveIcon fontSize="large" color="primary" />,
      link: "/admin/reservations",
    },
  ];

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 6, textAlign: "center" }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading dashboard...
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h4"
          component="h1"
          gutterBottom
          sx={{ fontWeight: "bold" }}
        >
          Admin Dashboard
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Welcome to the admin dashboard. Here you can manage flights, users,
          and more.
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Dashboard stats */}
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: 3,
          mb: 4,
        }}
      >
        {dashboardStats.map((stat, index) => (
          <Box
            key={index}
            sx={{
              flex: "1 1 calc(25% - 18px)",
              minWidth: {
                xs: "100%",
                sm: "calc(50% - 12px)",
                md: "calc(25% - 18px)",
              },
            }}
          >
            <Paper
              elevation={2}
              sx={{
                p: 3,
                height: "100%",
                display: "flex",
                flexDirection: "column",
                transition: "transform 0.2s, box-shadow 0.2s",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: 4,
                },
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 2,
                }}
              >
                <Typography variant="h6" color="text.secondary">
                  {stat.title}
                </Typography>
                {stat.icon}
              </Box>
              <Typography
                variant="h4"
                component="div"
                sx={{ mb: 2, fontWeight: "bold" }}
              >
                {stat.value}
              </Typography>
              {stat.link && (
                <Box sx={{ mt: "auto" }}>
                  <Button
                    variant="text"
                    color="primary"
                    onClick={() => handleNavigation(stat.link!)}
                  >
                    View Details
                  </Button>
                </Box>
              )}
            </Paper>
          </Box>
        ))}
      </Box>

      {/* Quick actions */}
      <Typography variant="h5" sx={{ mb: 3, fontWeight: "bold" }}>
        Quick Actions
      </Typography>
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: 3,
        }}
      >
        <Box
          sx={{
            flex: "1 1 calc(33.33% - 16px)",
            minWidth: {
              xs: "100%",
              md: "calc(33.33% - 16px)",
            },
          }}
        >
          <Card
            sx={{ height: "100%", display: "flex", flexDirection: "column" }}
          >
            <CardContent sx={{ flexGrow: 1 }}>
              <Typography variant="h6" component="div" gutterBottom>
                Flight Management
              </Typography>
              <Divider sx={{ my: 1 }} />
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Add, edit, or delete flights. Manage seat availability and
                pricing.
              </Typography>
            </CardContent>
            <CardActions>
              <Button
                size="small"
                onClick={() => handleNavigation("/admin/flights")}
              >
                Manage Flights
              </Button>
              <Button
                size="small"
                onClick={() => handleNavigation("/admin/flights/add")}
              >
                Add New Flight
              </Button>
            </CardActions>
          </Card>
        </Box>

        <Box
          sx={{
            flex: "1 1 calc(33.33% - 16px)",
            minWidth: {
              xs: "100%",
              md: "calc(33.33% - 16px)",
            },
          }}
        >
          <Card
            sx={{ height: "100%", display: "flex", flexDirection: "column" }}
          >
            <CardContent sx={{ flexGrow: 1 }}>
              <Typography variant="h6" component="div" gutterBottom>
                User Management
              </Typography>
              <Divider sx={{ my: 1 }} />
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                View and manage user accounts, reset passwords, and handle
                support requests.
              </Typography>
            </CardContent>
            <CardActions>
              <Button
                size="small"
                onClick={() => handleNavigation("/admin/users")}
              >
                Manage Users
              </Button>
            </CardActions>
          </Card>
        </Box>

        <Box
          sx={{
            flex: "1 1 calc(33.33% - 16px)",
            minWidth: {
              xs: "100%",
              md: "calc(33.33% - 16px)",
            },
          }}
        >
          <Card
            sx={{ height: "100%", display: "flex", flexDirection: "column" }}
          >
            <CardContent sx={{ flexGrow: 1 }}>
              <Typography variant="h6" component="div" gutterBottom>
                System Settings
              </Typography>
              <Divider sx={{ my: 1 }} />
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Configure system settings, manage access controls, and view
                system logs.
              </Typography>
            </CardContent>
            <CardActions>
              <Button
                size="small"
                onClick={() => handleNavigation("/admin/settings")}
              >
                System Settings
              </Button>
            </CardActions>
          </Card>
        </Box>
      </Box>
    </Container>
  );
};

export default AdminDashboard;
