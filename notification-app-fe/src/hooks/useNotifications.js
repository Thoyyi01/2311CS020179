import { useState, useEffect } from "react";
import { fetchNotifications } from "../api/notifications";

export function useNotifications({ limit, page, notificationType } = {}) {
  const [notifications, setNotifications] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await fetchNotifications({
          limit,
          page,
          notification_type: notificationType
        });
        setNotifications(data.notifications || []);
        setTotalPages(data.totalPages || 1);
        setTotalCount(data.totalCount || 0);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [limit, page, notificationType]);

  return {
    notifications,
    totalPages,
    totalCount,
    loading,
    error,
  };
}