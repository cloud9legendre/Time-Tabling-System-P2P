import { WebSocketServer, WebSocket } from 'ws';

interface SignalingMessage {
    type: string;
    from?: string;
    to?: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
}

/**
 * Simple WebSocket-based signaling server for WebRTC peer discovery.
 * This is embedded in the Electron app and runs when this node is the leader.
 */
export class SignalingServer {
    private wss: WebSocketServer | null = null;
    private clients: Map<string, WebSocket> = new Map();
    private port: number;

    constructor(port: number) {
        this.port = port;
    }

    async start(): Promise<void> {
        return new Promise((resolve, reject) => {
            try {
                this.wss = new WebSocketServer({ port: this.port });

                this.wss.on('listening', () => {
                    console.log(`[SignalingServer] Started on port ${this.port}`);
                    resolve();
                });

                this.wss.on('connection', (ws: WebSocket) => {
                    const clientId = this.generateClientId();
                    this.clients.set(clientId, ws);
                    console.log(`[SignalingServer] Client connected: ${clientId}`);

                    // Send client their ID
                    ws.send(JSON.stringify({ type: 'welcome', clientId }));

                    ws.on('message', (data: Buffer) => {
                        try {
                            const message: SignalingMessage = JSON.parse(data.toString());
                            this.handleMessage(clientId, message);
                        } catch (e) {
                            console.error('[SignalingServer] Invalid message:', e);
                        }
                    });

                    ws.on('close', () => {
                        this.clients.delete(clientId);
                        console.log(`[SignalingServer] Client disconnected: ${clientId}`);

                        // Notify other clients
                        this.broadcast({ type: 'peer-left', clientId }, clientId);
                    });

                    ws.on('error', (error) => {
                        console.error(`[SignalingServer] Client error: ${clientId}`, error);
                    });

                    // Notify other clients of new peer
                    this.broadcast({ type: 'peer-joined', clientId }, clientId);
                });

                this.wss.on('error', (error) => {
                    console.error('[SignalingServer] Server error:', error);
                    reject(error);
                });

            } catch (error) {
                reject(error);
            }
        });
    }

    private handleMessage(fromClientId: string, message: SignalingMessage): void {
        // Add sender info
        message.from = fromClientId;

        if (message.to) {
            // Direct message to specific client
            const targetWs = this.clients.get(message.to);
            if (targetWs && targetWs.readyState === WebSocket.OPEN) {
                targetWs.send(JSON.stringify(message));
            }
        } else {
            // Broadcast to all except sender
            this.broadcast(message, fromClientId);
        }
    }

    private broadcast(message: SignalingMessage, excludeClientId?: string): void {
        const messageStr = JSON.stringify(message);

        this.clients.forEach((ws, clientId) => {
            if (clientId !== excludeClientId && ws.readyState === WebSocket.OPEN) {
                ws.send(messageStr);
            }
        });
    }

    private generateClientId(): string {
        return `client-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    getPeerCount(): number {
        return this.clients.size;
    }

    getClients(): string[] {
        return Array.from(this.clients.keys());
    }

    broadcastShutdown(): void {
        console.log('[SignalingServer] Broadcasting shutdown message...');
        this.broadcast({ type: 'server-shutdown' });
    }

    stop(): void {
        if (this.wss) {
            this.clients.forEach((ws) => {
                ws.close();
            });
            this.clients.clear();
            this.wss.close();
            this.wss = null;
            console.log('[SignalingServer] Stopped');
        }
    }
}
