/// <reference path="./env.d.ts" />
declare module NodeJS {
    interface ProcessEnv {
        readonly NODE_ENV: 'development' | 'production' | 'test'
        readonly channel: 'stable' | 'beta' | 'insider'
        readonly shadowRootMode: 'open' | 'closed'

        /**
         * Debug flags
         */
        BUILD_DATE: string
        VERSION: string
        COMMIT_HASH: string
        COMMIT_DATE: string
        BRANCH_NAME: string
        /**
         * Run skip tests like
         * RUN_SKIP_TESTS=1 pnpm test
         */
        RUN_SKIP_TESTS: string
        DIRTY: string
        /** Only in development mode. */
        REACT_DEVTOOLS_EDITOR_URL: string
    }
}
