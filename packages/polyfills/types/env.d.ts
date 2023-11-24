declare module NodeJS {
    interface ProcessEnv {
        readonly NODE_ENV: 'development' | 'production' | 'test'
        readonly MASK_SENTRY_DSN: string
        /**
         * Run skip tests like
         * RUN_SKIP_TESTS=1 pnpm test
         */
        readonly RUN_SKIP_TESTS: string
        readonly BUILD_DATE: string
        readonly VERSION: string
        readonly COMMIT_HASH: string
        readonly COMMIT_DATE: string
        readonly BRANCH_NAME: string
        readonly DIRTY: boolean
        readonly CHANNEL: 'stable' | 'beta' | 'insider'
    }
}
declare namespace NodeJS {
    interface Process {
        env: ProcessEnv
    }
}
declare var process: NodeJS.Process
