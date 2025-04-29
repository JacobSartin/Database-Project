import React from "react";
import { AppBar, Toolbar, Typography } from "@mui/material";
import AirplanemodeActiveIcon from "@mui/icons-material/AirplanemodeActive";

interface TopBarProps {
  title?: string;
}

const TopBar: React.FC<TopBarProps> = ({ title = "SkyBooker Airlines" }) => {
  return (
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
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          {title}
        </Typography>
      </Toolbar>
    </AppBar>
  );
};

export default TopBar;
