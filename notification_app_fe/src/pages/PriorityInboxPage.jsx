import { useEffect, useState } from "react";
import {
  Box, Typography, CircularProgress, Alert, Chip, Divider,
  Slider, FormControl, InputLabel, Select, MenuItem,
  List, ListItem, ListItemText, ListItemIcon, Paper, Stack,
} from "@mui/material";
import StarIcon from "@mui/icons-material/Star";
import { useAuth } from "../context/AuthContext";
import { fetchNotifications, getTopN, PRIORITY_WEIGHT } from "../utils/notifications";
import { Log } from "../utils/logger";

const TYPE_COLOR = { Placement: "success", Result: "warning", Event: "info" };

export default function PriorityInboxPage({ viewedIds, markViewed }) {
  const { token } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [topN, setTopN] = useState(10);
  const [typeFilter, setTypeFilter] = useState("All");

  useEffect(() => {
    async function load() {
      try {
        await Log("frontend", "info", "component", "PriorityInboxPage mounted", token);
        const data = await fetchNotifications(token);
        await Log("frontend", "info", "api", `Loaded ${data.length} notifications`, token);
        setNotifications(data);
      } catch (err) {
        await Log("frontend", "error", "api", `Priority inbox error: ${err.message}`, token);
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

  const prioritized = getTopN(filtered, topN);

  const handleClick = async (id) => {
    markViewed(id);
    await Log("frontend", "info", "component", `Priority notification ${id} viewed`, token);
  };

  if (loading) return <Box display="flex" justifyContent="center" mt={6}><CircularProgress /></Box>;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Box>
      <Typography variant="h6" fontWeight={700} mb={2}>🏆 Priority Inbox</Typography>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={3} mb={3}>
        <Box flex={1}>
          <Typography variant="body2" gutterBottom>
            Show Top N: <strong>{topN}</strong>
          </Typography>
          <Slider min={1} max={20} value={topN}
            onChange={(_, v) => setTopN(v)} marks step={1} valueLabelDisplay="auto" />
        </Box>
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
      </Stack>
      <Paper elevation={2}>
        <List disablePadding>
          {prioritized.map((n, i) => {
            const isNew = !viewedIds.has(n.ID);
            return (
              <Box key={n.ID}>
                <ListItem button onClick={() => handleClick(n.ID)} sx={{
                  backgroundColor: isNew ? "action.hover" : "transparent",
                  borderLeft: "4px solid",
                  borderColor: n.Type === "Placement" ? "success.main"
                    : n.Type === "Result" ? "warning.main" : "info.main",
                }}>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <StarIcon fontSize="small" sx={{
                      color: n.Type === "Placement" ? "success.main"
                        : n.Type === "Result" ? "warning.main" : "info.main",
                    }} />
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography variant="body2" fontWeight={700}
                          sx={{ color: isNew ? "text.primary" : "text.secondary" }}>
                          #{i + 1} — {n.Message}
                        </Typography>
                        {isNew && <Chip label="NEW" size="small" color="primary" />}
                      </Box>
                    }
                    secondary={
                      <Box display="flex" gap={1} alignItems="center" mt={0.5}>
                        <Chip label={`${n.Type} · Priority ${PRIORITY_WEIGHT[n.Type]}`}
                          size="small" color={TYPE_COLOR[n.Type] || "default"} />
                        <Typography variant="caption" color="text.secondary">
                          {new Date(n.Timestamp).toLocaleString()}
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
                {i < prioritized.length - 1 && <Divider />}
              </Box>
            );
          })}
        </List>
      </Paper>
    </Box>
  );
}