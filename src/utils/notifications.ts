/**
 * Notification abstraction utility to support web alerts and Capacitor native notifications.
 */
export interface AppNotification {
  title: string;
  body: string;
  id?: number;
}

export const showLocalNotification = async (notification: AppNotification): Promise<void> => {
  if (typeof window === "undefined") return;

  // Future Capacitor Integration:
  // import { LocalNotifications } from '@capacitor/local-notifications';
  // await LocalNotifications.schedule({
  //   notifications: [{
  //     title: notification.title,
  //     body: notification.body,
  //     id: notification.id || Date.now(),
  //     schedule: { at: new Date(Date.now() + 1000) }
  //   }]
  // });

  if ("Notification" in window && Notification.permission === "granted") {
    new Notification(notification.title, { body: notification.body });
  } else {
    // Custom in-app event trigger fallback (so UI components can listen and toast)
    const event = new CustomEvent("app-toast-notify", {
      detail: { title: notification.title, message: notification.body },
    });
    window.dispatchEvent(event);
  }
};
