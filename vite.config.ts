import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Charge les variables du fichier .env.local
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],

    // Base path pour le deploiement (racine pour Amplify)
    base: '/',

    // Configuration du build
    build: {
      outDir: 'dist',
      sourcemap: mode === 'development',
      // Optimisation pour la production
      minify: mode === 'production' ? 'esbuild' : false,
      // Chunking pour de meilleures performances
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom', 'react-router-dom'],
            ui: ['lucide-react'],
          },
        },
      },
      // Limite de taille pour les warnings
      chunkSizeWarningLimit: 1000,
    },

    // Variables d'environnement injectees dans le code
    define: {
      'process.env': {
        API_KEY: JSON.stringify(env.API_KEY || ''),
        VITE_API_BASE_URL: JSON.stringify(env.VITE_API_BASE_URL || ''),
        VITE_AWS_REGION: JSON.stringify(env.VITE_AWS_REGION || 'eu-west-3'),
        VITE_AWS_S3_BUCKET: JSON.stringify(env.VITE_AWS_S3_BUCKET || ''),
        VITE_AWS_USER_POOL_ID: JSON.stringify(env.VITE_AWS_USER_POOL_ID || ''),
        VITE_AWS_USER_POOL_CLIENT_ID: JSON.stringify(env.VITE_AWS_USER_POOL_CLIENT_ID || ''),
        NODE_ENV: JSON.stringify(mode),
      }
    },

    // Configuration du serveur de developpement
    server: {
      port: 3000,
      open: true,
      // Support pour le SPA routing en dev
      historyApiFallback: true,
    },

    // Configuration du serveur de preview
    preview: {
      port: 4173,
    },

    // Resolution des modules
    resolve: {
      alias: {
        '@': '/src',
      },
    },

    // Optimisation des dependances
    optimizeDeps: {
      include: ['react', 'react-dom', 'react-router-dom', 'lucide-react'],
    },
  };
});
