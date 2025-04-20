// server.js
const WebSocket = require('ws');
const fs = require('fs');

const FILE_PATH = './info.json';
let messages = [];

// Load existing messages if available
if (fs.existsSync(FILE_PATH)) {
  try {
    messages = JSON.parse(fs.readFileSync(FILE_PATH));
  } catch {
    messages = [];
  }
}

const wss = new WebSocket.Server({ port: 8080 });

wss.on('connection', ws => {
  // Send all chat history to new client
  ws.send(JSON.stringify({ type: 'chat', messages }));

  ws.on('message', message => {
    try {
      const msg = JSON.parse(message);
      if (msg.type === 'message') {
        const newMsg = { user: msg.user, text: msg.text };
        messages.push(newMsg);
        fs.writeFileSync(FILE_PATH, JSON.stringify(messages, null, 2));

        // Broadcast to all connected clients
        const chatPayload = JSON.stringify({ type: 'chat', messages });
        wss.clients.forEach(client => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(chatPayload);
          }
        });
      }
    } catch (err) {
      console.error('Error processing message:', err);
    }
  });
});

console.log('WebSocket server running on ws://localhost:8080');
