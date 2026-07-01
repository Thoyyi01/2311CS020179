import { ToggleButton, ToggleButtonGroup } from "@mui/material";

const filters = ["All", "Placement", "Result", "Event"];

export function NotificationFilter({ value, onChange }) {
  return (
    <ToggleButtonGroup
      value={value}
      exclusive
      onChange={(_, newValue) => newValue !== null && onChange(newValue)}
      size="medium"
      sx={{
        backgroundColor: "#f5f5f7",
        p: "4px",
        borderRadius: "12px",
        border: "none",
        display: "flex",
        width: "fit-content",
        "& .MuiToggleButtonGroup-grouped": {
          border: "none",
          mx: "2px",
          borderRadius: "8px !important",
        },
      }}
    >
      {filters.map((type) => (
        <ToggleButton
          key={type}
          value={type}
          sx={{
            textTransform: "none",
            fontWeight: 600,
            fontSize: "13px",
            px: 2.5,
            py: 0.75,
            color: "#6e6e73",
            "&.Mui-selected": {
              backgroundColor: "#ffffff",
              color: "#1d1d1f",
              boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
              "&:hover": {
                backgroundColor: "#ffffff",
              },
            },
            "&:hover": {
              backgroundColor: "rgba(0,0,0,0.04)",
            },
          }}
        >
          {type}
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  );
}