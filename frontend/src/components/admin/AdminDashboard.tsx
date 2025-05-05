import React, { useState, useEffect } from "react";
import {
  Typography,
  Container,
  Box,
  Paper,
  CircularProgress,
  Alert,
  Grid,
} from "@mui/material";
import FlightIcon from "@mui/icons-material/Flight";
import AirlinesIcon from "@mui/icons-material/Airlines";
import AirplanemodeActiveIcon from "@mui/icons-material/AirplanemodeActive";
import PeopleIcon from "@mui/icons-material/People";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getDashboardStats, getAirports } from "../../services/adminApi";

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
  const [totalAirports, setTotalAirports] = useState(0);
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
        const data = await getDashboardStats();
        setStats(data);

        // Fetch airports to get total count
        const airports = await getAirports();
        setTotalAirports(airports.length);
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
        setTotalAirports(30); // Fallback airport count
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
      title: "Airports",
      value: totalAirports,
      icon: <LocationOnIcon fontSize="large" color="primary" />,
      link: "/admin/airports",
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
          aircraft, and reservations.
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Dashboard stats */}
      <Grid container spacing={3}>
        {dashboardStats.map((stat, index) => (
          <Grid
            key={index}
            sx={{ width: { xs: "100%", sm: "50%", md: "25%" } }}
          >
            <Paper
              elevation={2}
              sx={{
                p: 3,
                height: "100%",
                display: "flex",
                flexDirection: "column",
                transition: "transform 0.2s, box-shadow 0.2s",
                cursor: "pointer",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: 4,
                },
              }}
              onClick={() => stat.link && handleNavigation(stat.link)}
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
              <Typography variant="body2" color="text.secondary">
                Click to manage {stat.title.toLowerCase()}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default AdminDashboard;
