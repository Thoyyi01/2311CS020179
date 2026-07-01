import { useEffect, useState } from "react";
import {
  Alert,
  Badge,
  Box,
  CircularProgress,
  Divider,
  Pagination,
  Stack,
  Typography,
  Tabs,
  Tab,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Grid,
  Chip
} from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import InfoIcon from "@mui/icons-material/Info";
import StarIcon from "@mui/icons-material/Star";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";

import { NotificationCard } from "../components/NotificationCard";
import { NotificationFilter } from "../components/NotificationFilter";
import { useNotifications } from "../hooks/useNotifications";
import { fetchNotifications } from "../api/notifications";
import Log from "../../../logging-middleware/logger";

const WEIGHTS = {
  "Placement": 3,
  "Result": 2,
  "Event": 1
};

export function NotificationsPage() {
  const [tab, setTab] = useState(0);
  const [filter, setFilter] = useState("All");
  const [page, setPage] = useState(1);
  const [priorityLimit, setPriorityLimit] = useState(10);
  const [readIds, setReadIds] = useState([]);
  
  // State for all notifications to compute Priority Inbox
  const [allNotifications, setAllNotifications] = useState([]);
  const [loadingPriority, setLoadingPriority] = useState(false);

  // Hook for paginated "All Notifications" list
  const { notifications, totalPages, loading: loadingFeed, error: feedError } = useNotifications({
    limit: 5,
    page,
    notificationType: filter
  });

  // Load read notifications from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("read_notification_ids");
    if (saved) {
      try {
        setReadIds(JSON.parse(saved));
      } catch (e) {
        setReadIds([]);
      }
    }
    Log("frontend", "info", "page", "Notifications Page Loaded");
  }, []);

  // Fetch all notifications to compute Priority Inbox
  const loadAllNotifications = async () => {
    setLoadingPriority(true);
    try {
      const data = await fetchNotifications({ limit: 100 });
      setAllNotifications(data.notifications || []);
    } catch (err) {
      console.error("Failed to load priority feed:", err);
    } finally {
      setLoadingPriority(false);
    }
  };

  useEffect(() => {
    loadAllNotifications();
  }, [readIds.length]); // Refetch or update when read list changes to keep in sync

  const handleTabChange = (_, newTab) => {
    setTab(newTab);
    Log("frontend", "info", "page", `Switched to tab ${newTab === 0 ? "Priority" : "All"}`);
  };

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    setPage(1);
    Log("frontend", "info", "page", `Filter changed to ${newFilter}`);
  };

  const handlePageChange = (_, newPage) => {
    setPage(newPage);
    Log("frontend", "info", "page", `Page changed to ${newPage}`);
  };

  const handleLimitChange = (event) => {
    const newLimit = event.target.value;
    setPriorityLimit(newLimit);
    Log("frontend", "info", "page", `Priority limit changed to ${newLimit}`);
  };

  const handleToggleRead = (id) => {
    const isCurrentlyRead = readIds.includes(id);
    let nextReadIds;
    if (isCurrentlyRead) {
      nextReadIds = readIds.filter(x => x !== id);
      Log("frontend", "info", "page", `Marked unread: ${id}`);
    } else {
      nextReadIds = [...readIds, id];
      Log("frontend", "info", "page", `Marked read: ${id}`);
    }
    setReadIds(nextReadIds);
    localStorage.setItem("read_notification_ids", JSON.stringify(nextReadIds));
  };

  const handleMarkAllRead = () => {
    const allIds = [
      ...allNotifications.map(n => n.ID),
      ...notifications.map(n => n.ID)
    ];
    const uniqueIds = Array.from(new Set([...readIds, ...allIds]));
    setReadIds(uniqueIds);
    localStorage.setItem("read_notification_ids", JSON.stringify(uniqueIds));
    Log("frontend", "info", "page", "All notifications marked read");
  };

  // Compute Priority Inbox: Top 'n' unread notifications sorted by category weight and recency
  const unreadNotifications = allNotifications.filter(n => !readIds.includes(n.ID));
  
  const priorityNotifications = [...unreadNotifications]
    .sort((a, b) => {
      const weightA = WEIGHTS[a.Type] || 0;
      const weightB = WEIGHTS[b.Type] || 0;
      if (weightA !== weightB) {
        return weightB - weightA;
      }
      return new Date(b.Timestamp).getTime() - new Date(a.Timestamp).getTime();
    })
    .slice(0, priorityLimit);

  const totalUnreadCount = unreadNotifications.length;

  return (
    <Box sx={{ maxWidth: 840, mx: "auto", px: 3, py: 5 }}>
      {/* Header section */}
      <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", sm: "center" }} spacing={2} mb={4}>
        <Stack direction="row" alignItems="center" spacing={2}>
          <Badge badgeContent={totalUnreadCount} color="error" max={99} sx={{ "& .MuiBadge-badge": { fontWeight: 700, fontSize: "12px", height: 22, minWidth: 22, borderRadius: 11 } }}>
            <Box sx={{ p: 1.5, borderRadius: "50%", backgroundColor: "primary.main", color: "#ffffff", boxShadow: "0 4px 12px rgba(63, 81, 181, 0.3)", display: "flex" }}>
              <NotificationsIcon sx={{ fontSize: 24 }} />
            </Box>
          </Badge>
          <Box>
            <Typography variant="h4" fontWeight={800} sx={{ letterSpacing: "-0.5px" }}>
              Campus Inbox
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Real-time updates, results, and placement drives
            </Typography>
          </Box>
        </Stack>
        
        {totalUnreadCount > 0 && (
          <Button
            variant="outlined"
            startIcon={<DoneAllIcon />}
            onClick={handleMarkAllRead}
            sx={{
              borderRadius: "12px",
              textTransform: "none",
              fontWeight: 600,
              px: 2,
              py: 1,
              borderColor: "divider",
              color: "text.primary",
              "&:hover": {
                borderColor: "primary.main",
                backgroundColor: "primary.50"
              }
            }}
          >
            Mark All as Read
          </Button>
        )}
      </Stack>

      {/* Tabs segment */}
      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
        <Tabs 
          value={tab} 
          onChange={handleTabChange} 
          aria-label="navigation tabs"
          sx={{
            "& .MuiTabs-indicator": { height: 3, borderRadius: "3px 3px 0 0" },
            "& .MuiTab-root": { textTransform: "none", fontWeight: 700, fontSize: "16px", minWidth: 120 }
          }}
        >
          <Tab icon={<StarIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Priority Inbox" />
          <Tab icon={<FormatListBulletedIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="All Notifications" />
        </Tabs>
      </Box>

      {/* Tab Panel 0: Priority Inbox */}
      {tab === 0 && (
        <Box>
          <Grid container spacing={2.5} alignItems="center" mb={3}>
            <Grid item xs={12} sm={8}>
              <Alert 
                severity="info" 
                icon={<InfoIcon />}
                sx={{ 
                  borderRadius: "16px",
                  "& .MuiAlert-message": { fontSize: "13px", lineHeight: 1.5 } 
                }}
              >
                <strong>Smart Priority Sorting:</strong> Placement drives are highlighted first, followed by exam results, then college events. Within categories, newer items appear first.
              </Alert>
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth size="medium">
                <InputLabel id="priority-limit-label">Show Top N</InputLabel>
                <Select
                  labelId="priority-limit-label"
                  value={priorityLimit}
                  label="Show Top N"
                  onChange={handleLimitChange}
                  sx={{ borderRadius: "12px" }}
                >
                  <MenuItem value={5}>Top 5 Unread</MenuItem>
                  <MenuItem value={10}>Top 10 Unread</MenuItem>
                  <MenuItem value={15}>Top 15 Unread</MenuItem>
                  <MenuItem value={20}>Top 20 Unread</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          {loadingPriority && (
            <Box display="flex" justifyContent="center" py={8}>
              <CircularProgress size={40} thickness={4} />
            </Box>
          )}

          {!loadingPriority && priorityNotifications.length === 0 && (
            <Card sx={{ borderRadius: "20px", border: "1px dashed rgba(0,0,0,0.12)", boxShadow: "none", p: 4, textAlign: "center", backgroundColor: "transparent" }}>
              <CardContent>
                <Typography variant="h6" fontWeight={700} mb={1}>
                  Your Priority Inbox is clear! 🎉
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  You've read all the important placement, exam, and event updates.
                </Typography>
              </CardContent>
            </Card>
          )}

          {!loadingPriority && priorityNotifications.length > 0 && (
            <Stack spacing={2}>
              {priorityNotifications.map((n) => (
                <NotificationCard
                  key={n.ID}
                  notification={n}
                  isRead={readIds.includes(n.ID)}
                  onToggleRead={handleToggleRead}
                />
              ))}
            </Stack>
          )}
        </Box>
      )}

      {/* Tab Panel 1: All Notifications */}
      {tab === 1 && (
        <Box>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3, flexWrap: "wrap", gap: 2 }}>
            <NotificationFilter value={filter} onChange={handleFilterChange} />
            <Typography variant="body2" color="text.secondary" fontWeight={500}>
              Showing all matches
            </Typography>
          </Box>

          {loadingFeed && (
            <Box display="flex" justifyContent="center" py={8}>
              <CircularProgress size={40} thickness={4} />
            </Box>
          )}

          {!loadingFeed && feedError && (
            <Alert severity="error" sx={{ borderRadius: "16px" }}>
              Failed to load notifications: {feedError}
            </Alert>
          )}

          {!loadingFeed && !feedError && notifications.length === 0 && (
            <Card sx={{ borderRadius: "20px", border: "1px dashed rgba(0,0,0,0.12)", boxShadow: "none", p: 4, textAlign: "center", backgroundColor: "transparent" }}>
              <CardContent>
                <Typography variant="h6" fontWeight={700} mb={1}>
                  No notifications found
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Try clearing your filters or check back later.
                </Typography>
              </CardContent>
            </Card>
          )}

          {!loadingFeed && !feedError && notifications.length > 0 && (
            <Stack spacing={2}>
              {notifications.map((n) => (
                <NotificationCard
                  key={n.ID}
                  notification={n}
                  isRead={readIds.includes(n.ID)}
                  onToggleRead={handleToggleRead}
                />
              ))}
            </Stack>
          )}

          {!loadingFeed && !feedError && totalPages > 1 && (
            <Box display="flex" justifyContent="center" mt={4}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={handlePageChange}
                color="primary"
                shape="rounded"
                size="large"
                sx={{
                  "& .MuiPaginationItem-root": { borderRadius: "8px", fontWeight: 600 }
                }}
              />
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
}
