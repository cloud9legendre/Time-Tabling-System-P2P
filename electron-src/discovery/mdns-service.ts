import Bonjour from 'bonjour-service';
import { EventEmitter } from 'events';

/**
 * mDNS service for mesh signaling architecture.
 * - Advertises own signaling server
 * - Discovers ALL other signaling servers on LAN
 * - Emits 'peers-changed' when servers are added/removed
 */
export class MDNSService extends EventEmitter {
    private bonjour: Bonjour;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private service: any = null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private browser: any = null;
    private serviceName: string;
    private port: number;
    private instanceId: string;
    private discoveredServers: Map<string, string> = new Map(); // instanceId -> ws URL

    constructor(serviceName: string, port: number, instanceId: string = '') {
        super();
        this.bonjour = new Bonjour();
        this.serviceName = serviceName;
        this.port = port;
        this.instanceId = instanceId || `${Date.now()}`;
    }

    /**
     * Advertise own signaling server via mDNS
     */
    advertise(): void {
        this.service = this.bonjour.publish({
            name: `${this.serviceName}-${this.instanceId}`,
            type: 'lab-timetable',
            port: this.port,
            txt: {
                room: 'lab-timetable-mesh',
                version: '2.0',
                instanceId: this.instanceId
            }
        });

        console.log(`[mDNS] Advertising: ${this.serviceName}-${this.instanceId} on port ${this.port}`);
    }

    /**
     * Start continuous discovery of other signaling servers
     */
    startDiscovery(): void {
        console.log('[mDNS] Starting continuous discovery...');

        this.browser = this.bonjour.find({ type: 'lab-timetable' });

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        this.browser.on('up', (service: any) => {
            const instanceId = service.txt?.instanceId || service.name;

            // Skip own service
            if (instanceId === this.instanceId) {
                console.log('[mDNS] Ignoring own service');
                return;
            }

            // Get IP address (prefer IPv4)
            const addresses = service.addresses || [];
            const ipv4 = addresses.find((a: string) => !a.includes(':')) || addresses[0];

            if (ipv4 && service.port) {
                const url = `ws://${ipv4}:${service.port}`;
                console.log(`[mDNS] Discovered peer: ${instanceId} at ${url}`);

                this.discoveredServers.set(instanceId, url);
                this.emit('peers-changed');
            }
        });

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        this.browser.on('down', (service: any) => {
            const instanceId = service.txt?.instanceId || service.name;

            if (this.discoveredServers.has(instanceId)) {
                console.log(`[mDNS] Peer went down: ${instanceId}`);
                this.discoveredServers.delete(instanceId);
                this.emit('peers-changed');
            }
        });
    }

    /**
     * Get all discovered signaling server URLs
     */
    getDiscoveredServers(): string[] {
        return Array.from(this.discoveredServers.values());
    }

    /**
     * Stop advertising and discovery
     */
    stop(): void {
        if (this.browser) {
            this.browser.stop();
            this.browser = null;
        }
        if (this.service) {
            this.service.stop();
            this.service = null;
            console.log('[mDNS] Service unpublished');
        }
        this.bonjour.destroy();
    }
}
