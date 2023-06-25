/// <reference path="./env.d.ts" />

declare module NodeJS {
    interface ProcessEnv {
        readonly NODE_ENV: 'development' | 'production' | 'test'
        readonly channel: 'stable' | 'beta' | 'insider'

        /**
         * Run skip tests like
         * RUN_SKIP_TESTS=1 pnpm test
         */
        readonly RUN_SKIP_TESTS: string
        /** Only in development mode. */
        readonly REACT_DEVTOOLS_EDITOR_URL: string
    }
}
