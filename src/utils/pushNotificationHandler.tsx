import messaging from "@react-native-firebase/messaging";
import notifee, { EventType, AndroidImportance } from "@notifee/react-native";

export async function requestUserPermission() {
  try {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;
    if (enabled) return await getFCMToken();
  } catch (error) {
    console.warn("Notification permission is unavailable:", error);
  }
}

export async function getFCMToken() {
  try {
    const fcmToken = await messaging().getToken();
    return fcmToken || undefined;
  } catch (error) {
    console.warn("FCM token is unavailable:", error);
  }
}

async function createNotificationChannel() {
  return notifee.createChannel({
    id: "default",
    name: "Default Channel",
    importance: AndroidImportance.HIGH,
  });
}

async function showLocalNotification(remoteMessage: any) {
  const channelId = await createNotificationChannel();
  const title =
    remoteMessage.notification?.title ||
    remoteMessage.data?.title ||
    "New Notification";
  const body = remoteMessage.notification?.body || remoteMessage.data?.body || "";

  await notifee.displayNotification({
    title,
    body,
    android: {
      channelId,
      smallIcon: "ic_launcher",
      pressAction: { id: "default" },
    },
  });
}

export function NotificationServices() {
  try {
    const unsubscribe = messaging().onMessage(async remoteMessage => {
      try {
        await showLocalNotification(remoteMessage);
      } catch (error) {
        console.warn("Foreground notification is unavailable:", error);
      }
    });

    messaging().onNotificationOpenedApp(() => {});
    messaging().getInitialNotification().catch(error => {
      console.warn("Initial notification is unavailable:", error);
    });

    const unsubscribeNotifee = notifee.onForegroundEvent(({ type }) => {
      if (type === EventType.PRESS) {
        // Navigate here if needed.
      }
    });

    return () => {
      unsubscribe();
      unsubscribeNotifee();
    };
  } catch (error) {
    console.warn("Notification services are unavailable:", error);
    return () => {};
  }
}
