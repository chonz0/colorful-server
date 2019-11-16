const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const randomColor = require('randomcolor');

const app = express();

app.get('/status', function (req, res) {
  res.send('✅ Hello World!');
});

//initialize a simple http server
const server = http.createServer(app);

//initialize the WebSocket server instance
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
  ws.send(JSON.stringify({
    type: 'connection_count',
    payload: wss.clients.size
  }));

  // connection is up, let's add a simple simple event
  ws.on('message', (message) => {

    // log the received message and send it back to the client
    console.log('received: %s', message);

    if (message === 'getColor') {
      const color = randomColor(); // a hex code for an attractive color
      // ws.send(color);

      wss.clients.forEach(function each(client) {
        // if (/*client !== ws &&*/ client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({
            type: 'color',
            payload: color
          }));
        // }
      });

    } else {
      ws.send(JSON.stringify({
        type: 'message',
        payload: `Hello, you sent -> ${message}`
      }));
    }
  });

  // send immediatly a feedback to the incoming connection
  ws.send(JSON.stringify({
    type: 'status',
    status: 200,
    payload: '👋 Hi there, I am a WebSocket server'
  }));

  setInterval(() => {
    const color = randomColor(); // a hex code for an attractive color
    console.log('new color sent', color);
    ws.send(JSON.stringify({
      type: 'color',
      payload: color
    }));
  }, 10000);
});

// start our server
try {
  const port = process.env.PORT || 8999;
  // const port = 3000;
  server.listen(port, () => {
    console.log(`Server started on port ${server.address().port} :)`);
  });
} catch (e) {
  console.error(e);
}