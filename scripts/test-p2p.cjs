const { spawn } = require('child_process');
const path = require('path');
const electron = require('electron');

// Get the path to the main script (compiled)
const appPath = path.join(__dirname, '..');

const processes = {};

function startInstance(id, name, delay = 0) {
    if (delay > 0) console.log(`Waiting ${delay}ms before starting ${name}...`);

    setTimeout(() => {
        console.log(`🚀 Starting ${name}...`);

        const userDataDir = path.join(appPath, '.p2p-test-data', name.replace(/[^a-z0-9]/gi, '_'));

        const child = spawn(electron, [appPath, `--user-data-dir=${userDataDir}`], {
            cwd: appPath,
            env: {
                ...process.env,
                ELECTRON_INSTANCE: name
            },
            stdio: 'inherit',
            shell: true
        });

        processes[id] = child;

        child.on('close', (code) => {
            console.log(`${name} exited with code ${code}`);
            delete processes[id];
        });
    }, delay);
}

// Start Instance 1
startInstance('leader', 'Instance 1 (Leader)', 0);

// Start Instance 2 after 5 seconds
startInstance('follower', 'Instance 2 (Follower)', 5000);

// Kill Leader after 15 seconds to test Failover
setTimeout(() => {
    console.log('💀 KILLING LEADER to test Failover...');
    const leader = processes['leader'];
    if (leader) {
        // sending SIGTERM to kill the process key
        // On Windows with shell: true, we might need taskkill
        if (process.platform === 'win32') {
            spawn("taskkill", ["/pid", leader.pid, '/f', '/t']);
        } else {
            leader.kill();
        }
    } else {
        console.log('Leader process not found or already closed.');
    }
}, 15000);

// Keep Follower alive longer to see if it works
setTimeout(() => {
    console.log('✅ Test complete. Closing remaining instances...');
    Object.values(processes).forEach(p => {
        if (process.platform === 'win32') {
            spawn("taskkill", ["/pid", p.pid, '/f', '/t']);
        } else {
            p.kill();
        }
    });
    process.exit(0);
}, 30000);
