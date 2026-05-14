self.addEventListener("push", (event) => {
  const data = event.data?.json() ?? { title: "New message", body: "" };

  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clients) => {
        const chatFocused = clients.some(
          (c) => c.url.includes("/client/") && c.focused,
        );
        if (chatFocused) return;

        return self.registration.showNotification(data.title, {
          body: data.body,
          icon: "/icon-192.png",
          badge: "/icon-192.png",
          tag: "chat-message",
          renotify: true,
        });
      }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clients) => {
        const chatTab = clients.find((c) => c.url.includes("/client/"));
        if (chatTab) return chatTab.focus();
        return self.clients.openWindow("/client");
      }),
  );
});
