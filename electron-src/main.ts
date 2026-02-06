import { app, BrowserWindow, ipcMain, Tray, Menu, nativeImage } from 'electron';
import * as path from 'path';
import * as net from 'net';
import * as fs from 'fs';
import * as crypto from 'crypto';
import { SignalingServer } from './signaling/server';
import { MDNSService } from './discovery/mdns-service';
import { ConfigManager } from './config-manager';





// Keep a global reference to prevent garbage collection
let mainWindow: typeof BrowserWindow.prototype | null = null;
let tray: typeof Tray.prototype | null = null;
let signalingServer: SignalingServer | null = null;
let mdnsService: MDNSService | null = null;

// Mesh architecture: all discovered signaling URLs (including own)
let signalingUrls: string[] = [];
let ownPort: number = 0;
let authSecret: string = '';
let configManager: ConfigManager;

// Configuration
const SERVICE_NAME = 'lab-timetable-p2p';
const PORT_RANGE_START = 5000;
const PORT_RANGE_END = 5999;

// Generate unique instance ID for mDNS (using crypto for security)
const instanceId = crypto.randomUUID();

/**
 * Find an available port in the specified range
 */
function findAvailablePort(): Promise<number> {
    return new Promise((resolve, reject) => {
        const tryPort = (port: number) => {
            if (port > PORT_RANGE_END) {
                reject(new Error('No available ports in range'));
                return;
            }

            const server = net.createServer();
            server.listen(port, () => {
                server.close(() => resolve(port));
            });
            server.on('error', () => tryPort(port + 1));
        };

        // Start from random position in range to reduce collisions
        const randomStart = PORT_RANGE_START + Math.floor(Math.random() * (PORT_RANGE_END - PORT_RANGE_START));
        tryPort(randomStart);
    });
}

function createTray() {
    const iconName = 'icon.png';
    const possiblePaths = [
        path.join(__dirname, '../public', iconName),
        path.join(__dirname, '../dist', iconName),
        path.join(__dirname, iconName)
    ];

    let iconPath = possiblePaths[0];
    for (const p of possiblePaths) {
        if (fs.existsSync(p)) {
            iconPath = p;
            break;
        }
    }

    console.log('[Tray] Loading icon from:', iconPath);
    let trayIcon = nativeImage.createFromPath(iconPath);

    if (trayIcon.isEmpty()) {
        console.log('[Tray] WARNING: Tray icon is empty/not found. Using placeholder.');
        trayIcon = nativeImage.createEmpty();
    }

    try {
        tray = new Tray(trayIcon);
        updateTrayMenu();
        tray.setToolTip('Lab Timetable P2P');

        tray.on('click', () => {
            if (mainWindow) {
                if (mainWindow.isVisible()) {
                    mainWindow.hide();
                } else {
                    mainWindow.show();
                    mainWindow.focus();
                }
            }
        });
    } catch (err) {
        console.error('[Tray] Failed to create tray:', err);
    }
}

function updateTrayMenu() {
    if (!tray) return;

    const contextMenu = Menu.buildFromTemplate([
        {
            label: 'Lab Timetable P2P (Mesh)',
            enabled: false
        },
        { type: 'separator' },
        {
            label: `My Server: :${ownPort}`,
            enabled: false
        },
        {
            label: `Network: ${signalingUrls.length} servers`,
            enabled: false
        },
        { type: 'separator' },
        {
            label: 'Open',
            click: () => mainWindow?.show()
        },
        {
            label: 'Quit',
            click: () => app.quit()
        }
    ]);

    tray.setContextMenu(contextMenu);
}

function createWindow(): void {
    mainWindow = new BrowserWindow({
        width: 1400,
        height: 900,
        minWidth: 1024,
        minHeight: 700,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false,
        },
        backgroundColor: '#1a1a1a',
        show: false,
    });

    if (app.isPackaged) {
        mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
    } else {
        mainWindow.loadURL('http://localhost:5173');
    }

    if (!app.isPackaged) {
        mainWindow.webContents.openDevTools();
    }

    mainWindow.once('ready-to-show', () => {
        mainWindow?.maximize();
        mainWindow?.show();
        if (!tray) createTray();
    });

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function notifyRenderer(channel: string, data: any): void {
    if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send(channel, data);
    }
}

function updateSignalingUrls() {
    // Own server URL (use localhost for local, IP for LAN)
    const ownUrl = `ws://localhost:${ownPort}`;
    // const ownLanUrl = `ws://${localIp}:${ownPort}`;

    // Combine own + discovered (dedupe)
    const allUrls = new Set<string>([ownUrl]);

    // Add discovered servers (from mDNS)
    if (mdnsService) {
        const discovered = mdnsService.getDiscoveredServers();
        discovered.forEach(url => {
            // Don't add our own LAN URL
            if (!url.includes(`:${ownPort}`)) {
                allUrls.add(url);
            }
        });
    }

    signalingUrls = Array.from(allUrls);
    console.log(`📡 Signaling URLs updated: ${signalingUrls.length} servers`, signalingUrls);

    notifyRenderer('signaling-urls', signalingUrls);
    updateTrayMenu();
}

function getLocalIp(): string {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const interfaces = require('os').networkInterfaces();
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            if (iface.family === 'IPv4' && !iface.internal) {
                return iface.address;
            }
        }
    }
    return '127.0.0.1';
}

async function initializeP2P(): Promise<void> {
    console.log('🚀 Initializing P2P Mesh Network...');

    // Initialize Config Manager
    configManager = new ConfigManager();
    authSecret = configManager.getNetworkSecret();
    console.log(`🔑 Using persistent network secret (Invite Code): ${authSecret}`);

    // Step 1: Find available port and start own signaling server
    try {
        ownPort = await findAvailablePort();
        console.log(`🔌 Found available port: ${ownPort}`);

        signalingServer = new SignalingServer(ownPort, authSecret);
        await signalingServer.start();
        console.log(`✅ Own signaling server started on port ${ownPort}`);
    } catch (err) {
        console.error('❌ Failed to start signaling server:', err);
        return;
    }

    // Step 2: Advertise own server via mDNS and start discovery
    const localIp = getLocalIp();
    mdnsService = new MDNSService(SERVICE_NAME, ownPort, instanceId);

    // Listen for peer changes
    mdnsService.on('peers-changed', () => {
        console.log('🔄 Peers changed, updating URLs...');
        updateSignalingUrls();
    });

    // Start advertising and discovering
    mdnsService.advertise();
    mdnsService.startDiscovery();
    console.log(`📢 mDNS advertising on ${localIp}:${ownPort}`);

    // Step 3: Initial URL update
    setTimeout(() => {
        updateSignalingUrls();
    }, 1000);
}

// IPC Handlers
ipcMain.handle('get-signaling-info', async () => {
    return {
        urls: signalingUrls,
        port: ownPort,
        authToken: authSecret
    };
});

ipcMain.handle('get-invite-code', async () => {
    return authSecret;
});

ipcMain.handle('join-network', async (event, secret: string) => {
    console.log('🔗 Joining network with secret:', secret);
    configManager.setNetworkSecret(secret);
    app.relaunch();
    app.exit(0);
});

ipcMain.handle('reset-network', async () => {
    console.log('🔄 Resetting network secret (Creating new network)...');
    const newSecret = crypto.randomBytes(32).toString('hex');
    configManager.setNetworkSecret(newSecret);
    app.relaunch();
    app.exit(0);
});

ipcMain.handle('get-peer-count', async () => {
    return signalingServer ? signalingServer.getPeerCount() : 0;
});

// App lifecycle
app.whenReady().then(async () => {
    createWindow();
    await initializeP2P();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    // Clean up P2P resources
    console.log('🔌 Shutting down P2P mesh...');
    if (signalingServer) {
        signalingServer.stop();
    }
    if (mdnsService) {
        mdnsService.stop();
    }

    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('before-quit', () => {
    console.log('👋 App quitting - no handoff needed in mesh architecture');
});
