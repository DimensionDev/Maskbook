/// <reference types="web-ext-types" />
/// <reference types="react/next" />
/// <reference types="react-dom/next" />

declare module NodeJS {
    interface ProcessEnv {
        /** test means Jest. Puppeteer test does not use "test".  */
        readonly NODE_ENV: 'development' | 'production' | 'test'
        readonly STORYBOOK?: boolean
        readonly target: 'chromium' | 'firefox' | 'safari' | 'E2E'
        readonly build: 'stable' | 'beta' | 'insider'
        readonly architecture: 'web' | 'app'
        /** fennec = stable firefox; geckoview = next generation firefox (used in Android App, in future it will become the default engine on Firefox for Android) */
        readonly firefoxVariant: 'fennec' | 'geckoview' | false
        /**
         * STRONGLY SUGGEST to make the app flexible as possible!
         * This value is the build time fallback for the screen size.
         * It DOESN't means the app MUST run in this size.
         */
        readonly resolution: 'desktop' | 'mobile'
        /**
         * Which version of Web Extension manifest
         */
        readonly manifest: 2 | 3

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
        DIRTY: boolean
        TAG_DIRTY: boolean
    }
}
