import Log from "../../../logging-middleware/logger";

export async function fetchNotifications({ limit, page, notification_type } = {}) {
  let token = await Log.getToken();
  
  const url = new URL("http://4.224.186.213/evaluation-service/notifications");
  if (limit) url.searchParams.append("limit", limit);
  if (page) url.searchParams.append("page", page);
  if (notification_type && notification_type !== "All") {
    url.searchParams.append("notification_type", notification_type);
  }

  try {
    let response = await fetch(url.toString(), {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });

    let text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      data = { message: text };
    }

    if (data.message === "invalid authorization token") {
      console.log("Token expired, refreshing in frontend API...");
      const refreshedToken = await Log.refreshToken();
      response = await fetch(url.toString(), {
        headers: {
          "Authorization": `Bearer ${refreshedToken}`
        }
      });
      data = await response.json();
    }

    return {
      notifications: data.notifications || [],
      totalPages: data.totalPages || 1,
      totalCount: data.totalCount || 0
    };
  } catch (error) {
    console.error("Failed to fetch notifications in frontend API:", error.message);
    throw error;
  }
}