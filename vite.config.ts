import { defineConfig, type UserConfig } from 'vite'
import react from '@vitejs/plugin-react'
import compression from 'vite-plugin-compression'
import { visualizer } from 'rollup-plugin-visualizer'

// https://vite.dev/config/
export default defineConfig(({ mode }): UserConfig => {
  const isAnalyze = mode === 'analyze'

  return {
    plugins: [
      react(),
      // Gzip compression (most compatible)
      compression({
        algorithm: 'gzip',
        ext: '.gz',
        threshold: 1024,
        deleteOriginFile: false,
      }),
      // Brotli compression (better compression, modern browsers)
      compression({
        algorithm: 'brotliCompress',
        ext: '.br',
        threshold: 1024,
        deleteOriginFile: false,
      }),
      // Bundle analyzer (only when running build:analyze)
      isAnalyze && visualizer({
        open: true,
        filename: 'dist/bundle-stats.html',
        gzipSize: true,
        brotliSize: true,
        template: 'treemap', // or 'sunburst', 'network'
      }),
    ].filter(Boolean),

    server: {
      host: true,
      allowedHosts: true,
    },

    preview: {
      host: true,
      allowedHosts: true,
    },

    build: {
      // Target modern browsers for smaller bundles
      target: 'es2020',

      // Enable minification with esbuild (fastest)
      minify: 'esbuild',

      // Generate source maps for debugging production issues
      sourcemap: 'hidden',

      // Optimize chunk splitting
      rollupOptions: {
        output: {
          // Manual chunk splitting for optimal caching
          manualChunks: {
            // React core (rarely changes)
            'react-vendor': ['react', 'react-dom'],
            // Router (separate chunk)
            'router': ['react-router-dom'],
            // Supabase (lazy loaded)
            // 'supabase': ['@supabase/supabase-js'],
          },
          // Hash-based cache busting
          chunkFileNames: 'js/[name]-[hash].js',
          entryFileNames: 'js/[name]-[hash].js',
          assetFileNames: 'assets/[name]-[hash].[ext]',
        },
      },

      // Performance budgets
      chunkSizeWarningLimit: 200, // Warn at 200KB (target <200KB gzipped)

      // CSS optimizations
      cssCodeSplit: true,
      cssMinify: true,

      // Enable modern features
      modulePreload: {
        polyfill: true,
      },

      // Report compressed sizes
      reportCompressedSize: true,
    },

    // Optimize dependencies for faster dev server
    optimizeDeps: {
      include: ['react', 'react-dom', 'react-router-dom'],
    },

    // Environment variables
    define: {
      __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
      __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
    },
  }
})
