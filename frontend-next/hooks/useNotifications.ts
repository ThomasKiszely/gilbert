"use client";
import { useState, useEffect } from "react";

export function useNotifications(intervalMs = 15000) {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);

}