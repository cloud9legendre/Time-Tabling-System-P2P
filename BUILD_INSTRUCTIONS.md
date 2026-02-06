
# 📦 Manual Build Instructions (Windows)

Follow these steps to generate the `.exe` installer manually. This is useful if the automated script fails due to OneDrive syncing or antivirus interference.

---

### **Step 1: Clean Up**

Ensure no previous build artifacts are conflicting.

1. Open your project folder: `c:\Users\Ashen\OneDrive\Documents\Time-Tabling-System-P2P`
2. **Delete** the `release` folder if it exists.
3. **Delete** the `dist` and `dist-electron` folders if they exist.

### **Step 2: Build Source Code**

Run the following command in your terminal (VS Code or PowerShell) to compile the React and Electron code:

```powershell
npm run build:electron
```

*Wait for this to complete. It should create new `dist` and `dist-electron` folders.*

### **Step 3: Package the App**

Now, we run the packager.

**Option A: Standard Installer (Recommended)**

```powershell
npx electron-builder --win
```

*This will create a standard installer (Setup.exe).*

**Option B: Portable Executable (No Install Needed)**

```powershell
npx electron-builder --win portable
```

*This creates a single `.exe` file that runs immediately without installing.*

---

### **troubleshooting Common Errors**

**🔴 "EBUSY: resource busy or locked"**

* **Cause**: OneDrive is syncing files while the builder tries to modify them, or the app is currently running.
* **Fix**:
    1. Close any running instances of the app.
    2. **Pause OneDrive syncing** temporarily (Right-click OneDrive icon in tray -> Pause syncing -> 2 hours).
    3. Run the build command again.

**🔴 "winCodeSign" / Cache Errors**

* **Cause**: Corrupted cache for the signing utility.
* **Fix**:
    1. Run this command to clear the cache:

        ```powershell
        Remove-Item -Path "$env:LOCALAPPDATA\electron-builder\Cache" -Recurse -Force
        ```

    2. Try building again.

---

### **Step 4: Locate Your App**

Once successful, go to the `release` folder in your project directory.

* **Installer**: `Lab Timetable Setup 1.0.0.exe`
* **Portable**: `Lab Timetable 1.0.0.exe` (inside `release` folder directly).
