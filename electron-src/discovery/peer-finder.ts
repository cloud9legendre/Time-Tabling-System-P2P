import Bonjour from 'bonjour-service';

interface DiscoveredPeer {
    name: string;
    host: string;
    port: number;
    url: string;
}

/**
 * Discovers signaling servers on the LAN via mDNS.
 */
export class PeerFinder {
    private bonjour: Bonjour;
    private serviceName: string;

    constructor(serviceName: string) {
        this.bonjour = new Bonjour();
        this.serviceName = serviceName;
    }

    /**
     * Find existing signaling servers on the LAN.
     * @param timeoutMs How long to search before returning
     * @returns Array of signaling server URLs
     */
    async findPeers(timeoutMs: number = 3000): Promise<string[]> {
        return new Promise((resolve) => {
            const peers: DiscoveredPeer[] = [];

            console.log('[PeerFinder] Searching for signaling servers...');

            // Browse for services
            const browser = this.bonjour.find({ type: 'lab-timetable' });

            browser.on('up', (service: any) => {
                // Found a service!
                const peer: DiscoveredPeer = {
                    name: service.name,
                    host: service.host || service.addresses?.[0] || 'localhost',
                    port: service.port,
                    url: `ws://${service.host || service.addresses?.[0] || 'localhost'}:${service.port}`
                };

                // Don't add ourselves
                if (service.name !== this.serviceName) {
                    console.log(`[PeerFinder] Found peer: ${peer.name} at ${peer.url}`);
                    peers.push(peer);
                }
            });

            // Stop searching after timeout
            setTimeout(() => {
                browser.stop();
                console.log(`[PeerFinder] Search complete. Found ${peers.length} peers.`);
                resolve(peers.map(p => p.url));
            }, timeoutMs);
        });
    }

    destroy(): void {
        this.bonjour.destroy();
    }
}
