/// <reference path="./env.d.ts" />
declare module NodeJS {
    interface ProcessEnv {
        readonly NODE_ENV: 'development' | 'production' | 'test'
        readonly MASK_APP: boolean
        readonly MASK_SENTRY_DSN: string
        /**
         * Run skip tests like
         * RUN_SKIP_TESTS=1 pnpm test
         */
        readonly RUN_SKIP_TESTS: string
    }
}
declare namespace NodeJS {
    interface Process {
        env: ProcessEnv
    }
}
declare var process: NodeJS.Process
