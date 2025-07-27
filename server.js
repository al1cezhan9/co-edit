// backend server code
require('dotenv').config({ path: '.env.local' });


// import necessary modules
const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const cors = require('cors');

const app = express();
app.use(cors()); // allows front-end to communicate w/ backend w/o cross-origin issues

const server = http.createServer(app);
const wss = new WebSocket.Server({ server }); // websocket on same port as HTTP server

let document = ""; // text doc

wss.on('connection', (ws) => {
    console.log('New client connected');
    // send the current document to the newly connected client
    ws.send(JSON.stringify({ type: 'init', data: document }));
    ws.on('message', (message) => {
        try {
            const parsedMessage = JSON.parse(message);
            if (parsedMessage.type === 'update') {
                document = parsedMessage.data; // update local doc with new text
                // broadcast updated doc to all connected clients via loop
                wss.clients.forEach(client => {
                    // check if client is still connected + ready
                    if (client.readyState === WebSocket.OPEN) {
                        client.send(JSON.stringify({ type: 'update', data: document }));
                    }
                });
            }
        } catch (error) {
                console.error('Error parsing message:', error);
        }
    });
    ws.on('close', () => {
        console.log('Client disconnected');
    });
});

const PORT = process.env.PORT || 8080; // use PORT from .env.local or default to 8080
server.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});


