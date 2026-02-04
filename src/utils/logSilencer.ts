/**
 * Professional Log Silencer
 * 
 * This utility intercepts console methods and global error handlers to suppress 
 * specific noise patterns, particularly those related to P2P connectivity in mesh networks.
 * 
 * It filters:
 * 1. Expected connection refusals when peers disconnect (net::ERR_CONNECTION_REFUSED artifacts)
 * 2. WebSocket connection establishment logs from simple-peer/y-webrtc
 * 3. Benign timeouts during discovery
 */

const IGNORED_PATTERNS = [
    'ERR_CONNECTION_REFUSED',
    'WebSocket connection to',
    'Error in connection establishment',
    'failed: Error in connection establishment',
    'connection refused',
    'network timeout',
    'transport closed',
    'unexpected response code: 502',
    'unexpected response code: 504'
];

export function initializeLogSilencer() {
    if (typeof window === 'undefined') return;

    // 1. Intercept console.error
    const originalError = console.error;
    console.error = (...args: any[]) => {
        const msg = args[0];
        if (typeof msg === 'string' && IGNORED_PATTERNS.some(p => msg.includes(p))) {
            return; // Silenced
        }
        // Also check if the error object message contains patterns
        if (msg instanceof Error && IGNORED_PATTERNS.some(p => msg.message.includes(p))) {
            return;
        }
        originalError.apply(console, args);
    };

    // 2. Intercept console.warn (often used for non-critical connection issues)
    const originalWarn = console.warn;
    console.warn = (...args: any[]) => {
        const msg = args[0];
        if (typeof msg === 'string' && IGNORED_PATTERNS.some(p => msg.includes(p))) {
            return;
        }
        originalWarn.apply(console, args);
    };

    // 3. Handle Unhandled Promise Rejections
    window.addEventListener('unhandledrejection', (event) => {
        const reason = event.reason;
        const message = reason instanceof Error ? reason.message : String(reason);

        if (IGNORED_PATTERNS.some(p => message.includes(p))) {
            event.preventDefault(); // Prevent browser console log
            event.stopImmediatePropagation();
        }
    });

    // 4. Handle Global Errors
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    window.addEventListener('error', (event: ErrorEvent) => {
        const message = event.message;
        if (IGNORED_PATTERNS.some(p => message.includes(p))) {
            event.preventDefault();
            event.stopImmediatePropagation();
        }
    });

    console.log('[LogSilencer] P2P noise suppression active.');
}
