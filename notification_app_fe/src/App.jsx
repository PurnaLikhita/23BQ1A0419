import { useState } from "react";
import {
  AppBar, Box, Container, CssBaseline, Tab, Tabs, Toolbar,
  Typography, Button, ThemeProvider, createTheme,
} from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import { AuthProvider, useAuth } from "./context/AuthContext";
import LoginPage from "./pages/LoginPage";
import AllNotificationsPage from "./pages/AllNotificationsPage";
import PriorityInboxPage from "./pages/PriorityInboxPage";
import { Log } from "./utils/logger";

const theme = createTheme({
  palette: { mode: "light", primary: { main: "#1976d2" } },
});

function AppContent() {
  const { token, logout } = useAuth();
  const [tab, setTab] = useState(0);
  const [viewedIds, setViewedIds] = useState(new Set());

  const markViewed = (id) =>
    setViewedIds((prev) => new Set([...prev, id]));

  const handleLogout = async () => {
    await Log("frontend", "info", "component", "User logged out", token);
    logout();
  };

  if (!token) return <LoginPage />;

  return (
    <Box>
      <AppBar position="sticky">
        <Toolbar>
          <NotificationsIcon sx={{ mr: 1 }} />
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Campus Notification App
          </Typography>
          <Button color="inherit" onClick={handleLogout}>Logout</Button>
        </Toolbar>
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          textColor="inherit"
          indicatorColor="secondary"
          sx={{ backgroundColor: "primary.dark", px: 2 }}
        >
          <Tab label="All Notifications" />
          <Tab label="Priority Inbox" />
        </Tabs>
      </AppBar>
      <Container maxWidth="md" sx={{ py: 3 }}>
        {tab === 0 && <AllNotificationsPage viewedIds={viewedIds} markViewed={markViewed} />}
        {tab === 1 && <PriorityInboxPage viewedIds={viewedIds} markViewed={markViewed} />}
      </Container>
    </Box>
  );
}

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}