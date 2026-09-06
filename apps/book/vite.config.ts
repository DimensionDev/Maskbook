import { fileURLToPath } from 'node:url'
import { defaultClientConditions, defineConfig, searchForWorkspaceRoot } from 'vite'
import react from '@vitejs/plugin-react'
import wasm from 'vite-plugin-wasm'
import topLevelAwait from 'vite-plugin-top-level-await'

const workspaceRoot = searchForWorkspaceRoot(process.cwd())

export default defineConfig({
    // relative base so the built app also works when served from a sub-path
    base: './',
    // @masknet/shared-base re-exports @masknet/base, which loads tiny-secp256k1's wasm
    plugins: [wasm(), topLevelAwait(), react()],
    resolve: {
        // Mirror packages/mask/.webpack/config.ts `conditionNames: ['mask-src', '...']`.
        // Without this, `@masknet/theme` resolves to its dist entry, which is a `.d.ts` file.
        conditions: ['mask-src', ...defaultClientConditions],
        // The monorepo is symlink-heavy; keep a single copy of these.
        dedupe: ['react', 'react-dom', '@emotion/react', '@emotion/styled', '@mui/material', '@mui/system'],
    },
    server: {
        fs: {
            // allow importing package sources that live outside apps/book
            allow: [workspaceRoot],
        },
    },
    optimizeDeps: {
        // consume these from source, don't pre-bundle
        exclude: ['@masknet/icons', '@masknet/shared-base', '@masknet/theme'],
    },
    build: {
        outDir: 'dist',
        emptyOutDir: true,
        sourcemap: true,
    },
    define: {
        'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
    },
    // silence resolve of the workspace tsconfig path aliases we don't use here
    root: fileURLToPath(new URL('.', import.meta.url)),
})
