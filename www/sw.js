// Brain Dump – Service worker for PWA and notifications (iOS 16.4+ when added to Home Screen)
self.addEventListener('push', function (event) {
  if (!event.data) return;
  let payload = { title: 'Brain Dump', body: '' };
  try {
    const data = event.data.json();
    payload = { title: data.title || payload.title, body: data.body || data.text || '' };
  } catch (_) {
    payload.body = event.data.text();
  }
  event.waitUntil(
    self.registration.showNotification(payload.title, {
      body: payload.body,
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      tag: 'braindump',
      renotify: true
    })
  );
});

self.addEventListener('notificationclick', function (event) {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (clientList) {
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if (client.url.indexOf(self.registration.scope) >= 0 && 'focus' in client) {
          return client.focus();
        }
      }
      if (self.clients.openWindow) return self.clients.openWindow(self.registration.scope);
    })
  );
});
