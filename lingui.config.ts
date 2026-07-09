import { defineConfig } from '@lingui/cli'
import { formatter } from '@lingui/format-po'

export default defineConfig({
    compileNamespace: 'json',
    format: formatter({
        origins: true,
        lineNumbers: false,
    }),
    locales: ['en-US', 'ja-JP', 'ko-KR', 'zh-CN', 'zh-TW'],
    fallbackLocales: {
        'zh-CN': 'zh-TW',
        'zh-TW': 'zh-CN',
        default: 'en-US',
    },
    catalogs: [
        {
            path: './packages/shared-base-ui/src/locale/{locale}',
            include: ['<rootDir>'],
            exclude: ['**/node_modules/**', '**/*.d.ts', '**/dist/**', '**/build/**'],
        },
    ],
})
