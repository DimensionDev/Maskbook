/// <reference path="./env.d.ts" />
declare module NodeJS {
    interface ProcessEnv {
        readonly NODE_ENV: 'development' | 'production' | 'test'
        readonly channel: 'stable' | 'beta' | 'insider'

        /**
         * Debug flags
         */
        readonly BUILD_DATE: string
        readonly VERSION: string
        readonly COMMIT_HASH: string
        readonly COMMIT_DATE: string
        readonly BRANCH_NAME: string
        /**
         * Run skip tests like
         * RUN_SKIP_TESTS=1 pnpm test
         */
        readonly RUN_SKIP_TESTS: string
        readonly DIRTY: string
        /** Only in development mode. */
        readonly REACT_DEVTOOLS_EDITOR_URL: string
    }
}
