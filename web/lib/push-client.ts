
export async function registerPushToken() {
  if (typeof window === "undefined") return;  // SSR guard
  try {
    if (!("Notification" in window)) return;
    const perm = await Notification.requestPermission().catch(() => "denied");
    if (perm !== "granted") return;
    // TODO: integrate FCM later; safe no-op for now.
  } catch (e) {
    console.warn("Push registration skipped:", e);
  }
}
