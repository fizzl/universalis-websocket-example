import  *  as WebSocket from 'websocket'
import {serialize, deserialize} from 'bson'

export interface ISalesEvent {
    event: string;
    item: number;
    world: number;
    sales: ISalesItem[];
}

export interface ISalesItem {
    hq: boolean;
    pricePerUnit: number;
    quantity: number;
    timestamp: number;
    onMannequin: boolean;
    worldName: string;
    worldID: number;
    buyerName: string;
    total: number;
}

export class DataMetrics {
    startTime: number;
    packetsReceived: number = 0;
    dataReceived: number = 0;
    pointInTimePacketsReceived: number = 0;
    pointInTimeDataReceived: number = 0;
    pointInTimeReset: number;

    constructor() {
        this.startTime = Date.now();
        this.pointInTimeReset = Date.now();
    }

    receive(msg: WebSocket.Message) {
        if(msg.type !== 'binary') {
            console.log("Received non-binary message");
            return;
        }
        const binaryData = (msg as WebSocket.IBinaryMessage).binaryData;
        this.packetsReceived++;
        this.dataReceived += binaryData.byteLength;
        this.pointInTimePacketsReceived++;
        this.pointInTimeDataReceived += binaryData.byteLength;

        const data = deserialize(binaryData);
        switch (data.event) {
            case "sales/add":
                const salesEvent = data as ISalesEvent;
                this.onSalesEvent(salesEvent);
                break;
            default:
                console.log("Unknown event: " + data.event);
                break;
        }
    }

    onSalesEvent(data: ISalesEvent) {
        // console.log(data);
    }

    get packetsPerSecond() {
        return (this.packetsReceived / ((Date.now() - this.startTime) / 1000)).toFixed(2);
    }
    get bytesPerSecond() {
        return (this.dataReceived / ((Date.now() - this.startTime) / 1000)).toFixed(2);
    }
    get pointInTimePacketsPerSecond() {
        return (this.pointInTimePacketsReceived / ((Date.now() - this.pointInTimeReset) / 1000)).toFixed(2);
    }
    get pointInTimeBytesPerSecond() {
        return (this.pointInTimeDataReceived / ((Date.now() - this.pointInTimeReset) / 1000)).toFixed(2);
    }
    resetPointInTime() {
        this.pointInTimePacketsReceived = 0;
        this.pointInTimeDataReceived = 0;
        this.pointInTimeReset = Date.now();
    }
}