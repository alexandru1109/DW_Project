import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    root: 'src', // Specifică directorul rădăcină al proiectului
    plugins: [react()],
    build: {
        outDir: '../build', // Specifică directorul de ieșire pentru fișierele build-uite
        rollupOptions: {
            input: 'src/index.html', // Specifică calea relativă către fișierul index.html
        },
    },
    server: {
        host: '0.0.0.0', // Ascultă pe toate interfețele de rețea
        port: 5173, // Specifică portul pe care serverul va rula
    },
});
