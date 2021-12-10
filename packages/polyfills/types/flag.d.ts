/// <reference path="./env.d.ts" />
declare module NodeJS {
    interface ProcessEnv {
        readonly NODE_ENV: 'development' | 'production'
        readonly engine: 'chromium' | 'firefox' | 'safari'
        readonly channel: 'stable' | 'beta' | 'insider'
        readonly architecture: 'web' | 'app'
        readonly manifest: '2' | '3'

        /**
         * Debug flags
         */
        BUILD_DATE: string
        VERSION: string
        TAG_NAME: string
        COMMIT_HASH: string
        COMMIT_DATE: string
        REMOTE_URL: string
        BRANCH_NAME: string
        DIRTY: string
        TAG_DIRTY: string
    }
}
