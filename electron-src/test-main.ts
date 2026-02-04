import * as electron from 'electron';
const { app, BrowserWindow, ipcMain } = electron;

console.log('Electron loaded:', typeof electron, Object.keys(electron).slice(0, 10));
console.log('app:', typeof app);
console.log('ipcMain:', typeof ipcMain);

// Minimal test
ipcMain.handle('test', async () => 'works');

app.whenReady().then(() => {
    const win = new BrowserWindow({ width: 400, height: 300 });
    win.loadURL('data:text/html,<h1>Test</h1>');
});
