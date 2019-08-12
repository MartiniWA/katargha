self.addEventListener('push', function(event) {
	console.log('[Service Worker] Push Received.');
	console.log(`[Service Worker] Push had this data: "${event.data.text()}"`);

	const title = 'Appongo';
	const options = {
		body: 'Yay it works.',
		icon: 'icon.png',
		// badge: 'images/badge.png'
	};

	event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclose', function (e) {
	var notification = e.notification;
	var data = notification.data || {};
	var primaryKey = data.primaryKey;
	console.debug('Closed notification: ' + primaryKey);
});

self.addEventListener('notificationclick', function(e) {
	var notification = e.notification;
	var data = notification.data || {};
	var primaryKey = data.primaryKey;
	var action = e.action;
	console.debug('Clicked notification: ' + primaryKey);
	if (action === 'close') {
		console.debug('Notification clicked and closed', primaryKey);
		notification.close();
	} 
	else {
		console.debug('Notification auctioned', primaryKey);
		clients.openWindow('/');
		notification.close();
	}
});