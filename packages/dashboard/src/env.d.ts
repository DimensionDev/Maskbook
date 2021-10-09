/// <reference types="web-ext-types" />
/// <reference types="react/next" />
/// <reference types="react-dom/next" />

declare module NodeJS {
    interface ProcessEnv {
        readonly NODE_ENV: 'development' | 'production'
        readonly channel: 'stable' | 'beta' | 'insider'
        readonly architecture: 'web' | 'app'
        /**
         * Which version of Web Extension manifest
         */
        readonly manifest: 2 | 3

        VERSION: string
        TAG_NAME: string
        COMMIT_HASH: string
        COMMIT_DATE: string
        REMOTE_URL: string
        BRANCH_NAME: string
        DIRTY: boolean
        TAG_DIRTY: boolean
    }
}
