declare module NodeJS {
    interface ProcessEnv {
        readonly NODE_ENV: 'development' | 'production' | 'test'
        readonly MASK_SENTRY_DSN: string
        readonly MASK_SENTRY: 'enabled' | 'disabled'
        readonly MASK_MIXPANEL: 'enabled' | 'disabled'
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
