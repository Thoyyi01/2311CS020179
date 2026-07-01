import { Card, Box, Typography, Chip, IconButton, Tooltip } from "@mui/material";
import WorkIcon from "@mui/icons-material/Work";
import SchoolIcon from "@mui/icons-material/School";
import EventIcon from "@mui/icons-material/Event";
import DraftsIcon from "@mui/icons-material/Drafts";
import MarkAsUnreadIcon from "@mui/icons-material/MarkAsUnread";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

const TYPE_CONFIG = {
  Placement: {
    color: "#3f51b5", // Indigo
    bg: "#e8eaf6",
    icon: <WorkIcon sx={{ fontSize: 20, color: "#3f51b5" }} />,
    title: "Placement Drive"
  },
  Result: {
    color: "#9c27b0", // Purple
    bg: "#f3e5f5",
    icon: <SchoolIcon sx={{ fontSize: 20, color: "#9c27b0" }} />,
    title: "Exam Result"
  },
  Event: {
    color: "#009688", // Teal
    bg: "#e0f2f1",
    icon: <EventIcon sx={{ fontSize: 20, color: "#009688" }} />,
    title: "Campus Event"
  }
};

export function NotificationCard({ notification, isRead, onToggleRead }) {
  const config = TYPE_CONFIG[notification.Type] || {
    color: "#757575",
    bg: "#f5f5f5",
    icon: <EventIcon sx={{ fontSize: 20, color: "#757575" }} />,
    title: "Notification"
  };

  return (
    <Card
      sx={{
        position: "relative",
        borderRadius: "16px",
        border: "1px solid",
        borderColor: isRead ? "rgba(0,0,0,0.06)" : `${config.color}33`,
        background: isRead 
          ? "linear-gradient(to right, #fafafa, #ffffff)"
          : `linear-gradient(to right, ${config.color}05, #ffffff)`,
        boxShadow: isRead 
          ? "0 2px 8px rgba(0,0,0,0.02)"
          : `0 4px 16px ${config.color}0d`,
        transition: "all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)",
        overflow: "hidden",
        "&:hover": {
          transform: "translateY(-3px)",
          boxShadow: isRead 
            ? "0 6px 16px rgba(0,0,0,0.06)"
            : `0 8px 24px ${config.color}1a`,
          borderColor: config.color
        },
        display: "flex",
        flexDirection: { xs: "column", sm: "row" },
        alignItems: { xs: "flex-start", sm: "center" },
        p: 2.5,
        gap: 2
      }}
    >
      {/* Left indicator bar */}
      <Box
        sx={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: "5px",
          backgroundColor: config.color,
          opacity: isRead ? 0.3 : 1,
          borderRadius: "4px 0 0 4px"
        }}
      />

      {/* Category Icon */}
      <Box
        sx={{
          p: 1.5,
          borderRadius: "12px",
          backgroundColor: config.bg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}
      >
        {config.icon}
      </Box>

      {/* Main Content Area */}
      <Box sx={{ flex: 1 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5, flexWrap: "wrap" }}>
          <Typography variant="subtitle1" fontWeight={700} color="text.primary">
            {config.title}
          </Typography>
          
          <Chip
            label={notification.Type}
            size="small"
            sx={{
              height: "20px",
              fontSize: "11px",
              fontWeight: 600,
              backgroundColor: config.bg,
              color: config.color
            }}
          />

          {!isRead && (
            <Chip
              label="NEW"
              size="small"
              color="error"
              sx={{
                height: "20px",
                fontSize: "10px",
                fontWeight: 800,
                borderRadius: "4px",
                animation: "pulse 2s infinite"
              }}
            />
          )}
        </Box>

        <Typography variant="body2" color="text.secondary" mb={1} sx={{ lineHeight: 1.6 }}>
          {notification.Message}
        </Typography>

        <Typography variant="caption" color="text.disabled" fontWeight={500}>
          {new Date(notification.Timestamp).toLocaleString()}
        </Typography>
      </Box>

      {/* Actions */}
      <Box sx={{ display: "flex", alignItems: "center", alignSelf: { xs: "flex-end", sm: "center" }, gap: 1 }}>
        <Tooltip title={isRead ? "Mark as Unread" : "Mark as Read"}>
          <IconButton 
            onClick={() => onToggleRead(notification.ID)} 
            size="small"
            sx={{ 
              color: isRead ? "text.disabled" : config.color,
              "&:hover": { backgroundColor: `${config.color}11` }
            }}
          >
            {isRead ? <MarkAsUnreadIcon fontSize="small" /> : <DraftsIcon fontSize="small" />}
          </IconButton>
        </Tooltip>
      </Box>
      
      {/* Dynamic pulse animation for NEW badge */}
      <style>{`
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(211, 47, 47, 0.4); }
          70% { box-shadow: 0 0 0 6px rgba(211, 47, 47, 0); }
          100% { box-shadow: 0 0 0 0 rgba(211, 47, 47, 0); }
        }
      `}</style>
    </Card>
  );
}