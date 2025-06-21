import { defineConfig } from 'vite'

export default defineConfig({
  base: '/ens-voicemail/',
  server: {
    port: 8081,
    host: true,
    open: true, // Automatically open browser
    cors: true, // Enable CORS for API calls
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true, // Better debugging
  },
  // Handle audio files and other assets
  assetsInclude: ['**/*.wav', '**/*.mp3', '**/*.ogg'],
  // Development optimizations
  esbuild: {
    target: 'es2020', // Modern JavaScript features
  },
  // Plugin for better error handling
  plugins: [
    {
      name: 'audio-support',
      configureServer(server) {
        // Add headers for audio context
        server.middlewares.use((req, res, next) => {
          res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
          res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
          next();
        });
      }
    }
  ]
}) 