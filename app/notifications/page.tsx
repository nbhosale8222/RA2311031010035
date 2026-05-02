"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Container,
  Typography,
  Tabs,
  Tab,
  Box,
  List,
  ListItem,
  ListItemText,
  Badge,
  CircularProgress,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Pagination,
  Paper,
  Divider,
} from "@mui/material";
import { useNotifications, sortPriority, Notification } from "@/hooks/useNotifications";

export default function NotificationsPage() {
  const [tabIndex, setTabIndex] = useState(0); // 0: All, 1: Priority
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [viewedIds, setViewedIds] = useState<Set<string>>(new Set());

  const { notifications, loading, error, fetchNotifications } = useNotifications();

  useEffect(() => {
    const stored = localStorage.getItem("viewed_notifications");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setViewedIds(new Set(parsed));
      } catch (e) {
      }
    }
  }, []);

  const markAsViewed = (id: string) => {
    setViewedIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      localStorage.setItem("viewed_notifications", JSON.stringify(Array.from(next)));
      return next;
    });
  };

  useEffect(() => {
    fetchNotifications({
      page,
      limit,
      notification_type: typeFilter || undefined,
    });
  }, [fetchNotifications, page, limit, typeFilter]);

  const priorityNotifications = useMemo(() => {
    return sortPriority(notifications, limit);
  }, [notifications, limit]);

  const displayedNotifications = tabIndex === 0 ? notifications : priorityNotifications;

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabIndex(newValue);
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Notifications
      </Typography>

      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}>
        <Tabs value={tabIndex} onChange={handleTabChange} aria-label="notification tabs">
          <Tab label="All Notifications" />
          <Tab label="Priority Inbox" />
        </Tabs>
      </Box>

      {tabIndex === 0 && (
        <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Type</InputLabel>
            <Select
              value={typeFilter}
              label="Type"
              onChange={(e) => {
                setTypeFilter(e.target.value);
                setPage(1);
              }}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="Placement">Placement</MenuItem>
              <MenuItem value="Result">Result</MenuItem>
              <MenuItem value="Event">Event</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 100 }}>
            <InputLabel>Limit</InputLabel>
            <Select
              value={limit}
              label="Limit"
              onChange={(e) => {
                setLimit(Number(e.target.value));
                setPage(1);
              }}
            >
              <MenuItem value={5}>5</MenuItem>
              <MenuItem value={10}>10</MenuItem>
              <MenuItem value={20}>20</MenuItem>
            </Select>
          </FormControl>
        </Box>
      )}

      {loading && <CircularProgress sx={{ display: "block", mx: "auto", my: 4 }} />}
      
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {!loading && !error && displayedNotifications.length === 0 && (
        <Typography variant="body1" color="text.secondary">
          No notifications found.
        </Typography>
      )}

      {!loading && !error && displayedNotifications.length > 0 && (
        <Paper elevation={1}>
          <List>
            {displayedNotifications.map((notif, index) => {
              const isUnread = !viewedIds.has(notif.ID);
              return (
                <div key={notif.ID}>
                  <ListItem
                    onClick={() => markAsViewed(notif.ID)}
                    sx={{
                      cursor: "pointer",
                      bgcolor: isUnread ? "action.hover" : "inherit",
                    }}
                  >
                    <ListItemText
                      primary={
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <Typography variant="subtitle1" fontWeight={isUnread ? "bold" : "normal"}>
                            {notif.Message}
                          </Typography>
                          {isUnread && <Badge color="primary" variant="dot" />}
                        </Box>
                      }
                      secondary={
                        <Typography variant="body2" color="text.secondary">
                          {notif.Type} &bull; {new Date(notif.Timestamp).toLocaleString()}
                        </Typography>
                      }
                    />
                  </ListItem>
                  {index < displayedNotifications.length - 1 && <Divider />}
                </div>
              );
            })}
          </List>
        </Paper>
      )}

      {!loading && !error && tabIndex === 0 && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 3, pb: 4 }}>
          <Pagination
            count={10}
            page={page}
            onChange={(e, value) => setPage(value)}
            color="primary"
          />
        </Box>
      )}
    </Container>
  );
}
