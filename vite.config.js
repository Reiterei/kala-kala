import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { qrcode } from "vite-plugin-qrcode";

export default defineConfig({
plugins: [react(), qrcode()],
server: {
port: 5173, // custom port number - optional
open: true, // Automatically open the browser
host: true, // Allow access from other devices on the local network
},
});
