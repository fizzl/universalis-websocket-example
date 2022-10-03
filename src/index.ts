import  *  as WebSocket from 'websocket'
import { DataMetrics } from './data-metrics';
import {serialize, deserialize} from 'bson'

const addr = "wss://universalis.app/api/ws";

const client = new WebSocket.client();
const metrics = new DataMetrics();

client.on('connectFailed', function(error) {
    console.log('Connect Error: ' + error.toString());
});

client.on('connect', function(connection) {
    console.log('WebSocket Client Connected');
    connection.on('error', function(error) {
        console.log("Connection Error: " + error.toString());
    });
    connection.on('close', function() {
        console.log('Connection Closed');
    });
    connection.on('message', (msg) => metrics.receive(msg));
    connection.send(serialize({event: "subscribe", channel: "sales/add"}));
});

client.connect(addr);

setInterval(() => {
    console.log(`Packets per second: ${metrics.packetsPerSecond}`);
    console.log(`Bytes per second: ${metrics.bytesPerSecond}`);
    console.log(`Last Packets per second: ${metrics.pointInTimePacketsPerSecond}`);
    console.log(`Last Bytes per second: ${metrics.pointInTimeBytesPerSecond}`);
    metrics.resetPointInTime();
}, 1000);
