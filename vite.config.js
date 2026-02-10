import { defineConfig } from 'vite';

export default defineConfig({
    server: {
        proxy: {
            '/send-email': {
                target: 'http://localhost:3000',
                changeOrigin: true,
                secure: false,
            }
        }
    },
    build: {
        outDir: 'dist',
        assetsDir: 'assets',
    }
});
