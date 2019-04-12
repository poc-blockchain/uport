// events.js
const EventEmitter = require('eventemitter3');
const emitter = new EventEmitter();

function subscribe(req, res) {
	tagId = req.params.tagId;
	eventName = 'event_' + `${tagId}`;

	res.writeHead(200, {
		'Content-Type': 'text/event-stream',
		'Cache-Control': 'no-cache',
		Connection: 'keep-alive'
	});

	// Heartbeat
	const nln = function() {
		res.write('\n');
	};
	const hbt = setInterval(nln, 15000);

	const onEvent = function(data) {
		res.write('retry: 500\n');
		res.write(`event: ${eventName}\n`);
		res.write(`data: ${JSON.stringify(data)}\n\n`);
	};
    console.log(`Register event Name= ${eventName}`);
	emitter.on(eventName, onEvent);

	// Clear heartbeat and listener
	req.on('close', function() {
		console.log(`The ${eventName} is closed.`);
		clearInterval(hbt);
		emitter.removeListener(eventName, onEvent);
	});
}

function publish(tagId, eventData) {
    // Emit events here recieved from Github/Twitter APIs
    eventName = 'event_' + `${tagId}`;
    console.log(`Emit eventName=${eventName}`);
	emitter.emit(eventName, eventData);
}

module.exports = {
	subscribe, // Sending event data to the clients 
	publish // Emiting events from streaming servers
};