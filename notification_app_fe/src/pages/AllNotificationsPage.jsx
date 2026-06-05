import { useEffect, useState } from "react";
import {
  Box, Typography, CircularProgress, Alert, Chip, Divider,
  FormControl, InputLabel, Select, MenuItem, List, ListItem,
  ListItemText, ListItemIcon, Paper,
} from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import { useAuth } from "../context/AuthContext";
import { fetchNotifications } from "../utils/notifications";
import { Log } from "../utils/logger";

const TYPE_COLOR = { Placement: "success", Result: "warning", Event: "info" };

export default function AllNotificationsPage({ viewedIds, markViewed }) {
  const { token } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");

  useEffect(() => {
    async function load() {
      try {
        await Log("frontend", "info", "component", "AllNotificationsPage mounted", token);
        const data = await fetchNotifications(token);
        await Log("frontend", "info", "api", `Loaded ${data.length} notifications`, token);
        setNotifications(data);
      } catch (err) {
        await Log("frontend", "error", "api", `Failed to load: ${err.message}`, token);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [token]);

  const filtered = typeFilter === "All"
    ? notifications
    : notifications.filter((n) => n.Type === typeFilter);

  const handleClick = async (id) => {
    markViewed(id);
    await Log("frontend", "info", "component", `Notification ${id} marked as viewed`, token);
  };

  if (loading) return <Box display="flex" justifyContent="center" mt={6}><CircularProgress /></Box>;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6" fontWeight={700}>
          All Notifications ({filtered.length})
        </Typography>
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>Filter by Type</InputLabel>
          <Select value={typeFilter} label="Filter by Type"
            onChange={(e) => setTypeFilter(e.target.value)}>
            <MenuItem value="All">All</MenuItem>
            <MenuItem value="Placement">Placement</MenuItem>
            <MenuItem value="Result">Result</MenuItem>
            <MenuItem value="Event">Event</MenuItem>
          </Select>
        </FormControl>
      </Box>
      <Paper elevation={2}>
        <List disablePadding>
          {filtered.map((n, i) => {
            const isNew = !viewedIds.has(n.ID);
            return (
              <Box key={n.ID}>
                <ListItem button onClick={() => handleClick(n.ID)} sx={{
                  backgroundColor: isNew ? "action.hover" : "transparent",
                  borderLeft: isNew ? "4px solid" : "4px solid transparent",
                  borderColor: isNew ? "primary.main" : "transparent",
                }}>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <NotificationsIcon color={isNew ? "primary" : "disabled"} fontSize="small" />
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography variant="body2" fontWeight={isNew ? 700 : 400}>
                          {n.Message}
                        </Typography>
                        {isNew && <Chip label="NEW" size="small" color="primary" />}
                      </Box>
                    }
                    secondary={
                      <Box display="flex" gap={1} alignItems="center" mt={0.5}>
                        <Chip label={n.Type} size="small"
                          color={TYPE_COLOR[n.Type] || "default"} variant="outlined" />
                        <Typography variant="caption" color="text.secondary">
                          {new Date(n.Timestamp).toLocaleString()}
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
                {i < filtered.length - 1 && <Divider />}
              </Box>
            );
          })}
        </List>
      </Paper>
    </Box>
  );
}