import { defineConfig } from 'vite'
import { viteStaticCopy } from 'vite-plugin-static-copy';

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
    viteStaticCopy({
      targets: [
        {
          src: 'js/ethers-5.7.2.umd.min.js',
          dest: 'js'
        }
      ]
    }),
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