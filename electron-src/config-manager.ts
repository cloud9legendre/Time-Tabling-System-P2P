
import * as path from 'path';
import * as fs from 'fs';
import * as crypto from 'crypto';
import { app } from 'electron';

interface AppConfig {
    networkSecret: string;
}

export class ConfigManager {
    private configPath: string;
    private config: AppConfig;

    constructor() {
        this.configPath = path.join(app.getPath('userData'), 'config.json');
        this.config = this.loadConfig();
    }

    private loadConfig(): AppConfig {
        try {
            if (fs.existsSync(this.configPath)) {
                const data = fs.readFileSync(this.configPath, 'utf8');
                return JSON.parse(data);
            }
        } catch (e) {
            console.error('Failed to load config, using defaults', e);
        }

        // Default: Create a new unique network secret
        const defaultConfig: AppConfig = {
            networkSecret: crypto.randomBytes(32).toString('hex')
        };
        this.saveConfig(defaultConfig);
        return defaultConfig;
    }

    private saveConfig(config: AppConfig) {
        try {
            fs.writeFileSync(this.configPath, JSON.stringify(config, null, 2));
        } catch (e) {
            console.error('Failed to save config', e);
        }
    }

    public getNetworkSecret(): string {
        return this.config.networkSecret;
    }

    public setNetworkSecret(secret: string) {
        this.config.networkSecret = secret;
        this.saveConfig(this.config);
    }
}
