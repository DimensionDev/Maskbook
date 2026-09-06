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
        // Mirror packages/mask/.webpack/config.ts `resolve.extensionAlias`. packages/mask source
        // files import siblings with a `.js` specifier even though the file on disk is `.ts`/`.tsx`
        // (TS `moduleResolution: bundler`); popups/injection demos pull those files in directly.
        extensionAlias: {
            '.js': ['.js', '.tsx', '.ts'],
        },
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
        exclude: ['@masknet/icons', '@masknet/injected-ui', '@masknet/shared-base', '@masknet/theme'],
    },
    build: {
        outDir: 'dist',
        emptyOutDir: true,
        sourcemap: true,
        // @masknet/icons renders most icons as `background-image: url(<icon>)` with an
        // UNQUOTED url(). Vite's inlined `data:image/svg+xml,<url-encoded>` URIs contain
        // characters that break an unquoted url(), so most icons vanish in the prod build
        // (dev is fine — files are served raw). Emit every icon as its own file instead.
        assetsInlineLimit: 0,
    },
    define: {
        'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
    },
    // silence resolve of the workspace tsconfig path aliases we don't use here
    root: fileURLToPath(new URL('.', import.meta.url)),
})
