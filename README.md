# Lab Timetable P2P 🕸️📅

A decentralized, offline-first laboratory timetabling system built with Electron, React, and Yjs. This application enables real-time synchronization of scheduling data across a peer-to-peer (P2P) mesh network, eliminating the need for a central database server.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Electron](https://img.shields.io/badge/Electron-v34.0.0-blueviolet)
![React](https://img.shields.io/badge/React-v19.0.0-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-v5.7.2-blue)

## 🚀 Key Features

*   **P2P Mesh Synchronization**: changes made by one user are instantly propagated to all connected peers using WebRTC and Yjs.
*   **Offline First**: The application works fully offline (using IndexedDB) and syncs changes when other peers come online.
*   **Role-Based Access Control**:
    *   **Admins**: Manage labs, modules, instructors, and approve/reject leave requests.
    *   **Instructors**: View schedules, book slots, and request leaves.
*   **Dynamic Calendar**:
    *   Interactive grid view with support for massive amounts of bookings (dynamic row scaling and scrolling).
    *   **Instructor Color Coding**: Each instructor is assigned a unique color for easy visual connection on the timetable.
*   **Leave Management**:
    *   Instructors can request leave.
    *   Admins can view conflicts and approve/reject requests.
    *   Approved leaves are visually indicated on the calendar.
*   **Modern UI/UX**:
    *   Glassmorphism aesthetics with Tailwind CSS.
    *   Smooth animations and transition effects.
    *   Desktop-native experience via Electron.

## 🛠️ Tech Stack

*   **Frontend**: React, TypeScript, Tailwind CSS, Vite
*   **Desktop Runtime**: Electron
*   **State Management & Sync**: Yjs, y-webrtc, y-indexeddb
*   **Icons**: Lucide React

## 📦 Installation & Setup

1.  **Clone the repository**
    ```bash
    git clone https://github.com/cloud9legendre/Time-Tabling-System-P2P.git
    cd Time-Tabling-System-P2P
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    ```

3.  **Run Development Mode (Electron)**
    ```bash
    npm run electron
    ```
    *This will start the React dev server and launch the Electron application.*

## 🏗️ Architecture

The system uses a **Mesh Network Architecture**:
1.  **Discovery**: Each client acts as a signaling server (on a random port) and broadcasts its presence via mDNS (multicast DNS).
2.  **Connection**: Clients discover each other and form a full mesh network using WebRTC.
3.  **Sync**: `Yjs` handles the CRDT (Conflict-free Replicated Data Type) logic to merge changes from all peers deterministically, ensuring extensive scheduled data consistency even with concurrent edits.

## 👥 Usage Guide

### Logging In
*   **Admin**: Use the configured admin credentials (defined in `constants.ts`).
*   **Instructor**: Login with email/password. Default seeds include:
    *   `alan@jurassic.edu` / `password`
    *   `ellie@jurassic.edu` / `password`
    *   `ian@jurassic.edu` / `password`

### Admin Console
Access the Admin Dashboard to:
*   Add/Edit Instructors, Labs, and Modules.
*   Review pending Leave Requests.
*   Manage booking conflicts (auto-detected).

### Seeding Data
The application includes a `seedData` utility that populates the database with sample data (Instructors, Bookings for Feb 2026, Leaves) if the local database is empty.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
