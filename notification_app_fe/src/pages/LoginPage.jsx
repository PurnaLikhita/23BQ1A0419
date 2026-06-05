import { useState } from "react";
import {
  Box, Button, Container, TextField, Typography,
  Alert, CircularProgress, Paper,
} from "@mui/material";
import { useAuth } from "../context/AuthContext";
import { Log } from "../utils/logger";

const AUTH_URL = "http://4.224.186.213/evaluation-service/auth";

export default function LoginPage() {
  const { login } = useAuth();
  const [form, setForm] = useState({
    email: "", name: "", rollNo: "",
    accessCode: "", clientID: "", clientSecret: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(AUTH_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok || !data.access_token)
        throw new Error(data.message || "Authentication failed");
      await Log("frontend", "info", "api", "User authenticated successfully", data.access_token);
      login(data.access_token);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 10 }}>
      <Paper elevation={4} sx={{ p: 4, borderRadius: 3 }}>
        <Typography variant="h5" fontWeight={700} mb={3} textAlign="center">
          🔔 Notification App — Login
        </Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {[
          { name: "email", label: "College Email" },
          { name: "name", label: "Full Name" },
          { name: "rollNo", label: "Roll Number" },
          { name: "accessCode", label: "Access Code" },
          { name: "clientID", label: "Client ID" },
          { name: "clientSecret", label: "Client Secret", type: "password" },
        ].map((f) => (
          <TextField
            key={f.name} fullWidth label={f.label} name={f.name}
            type={f.type || "text"} value={form[f.name]}
            onChange={handleChange} sx={{ mb: 2 }} size="small"
          />
        ))}
        <Button variant="contained" fullWidth size="large"
          onClick={handleSubmit} disabled={loading}>
          {loading ? <CircularProgress size={22} color="inherit" /> : "Authenticate"}
        </Button>
      </Paper>
    </Container>
  );
}