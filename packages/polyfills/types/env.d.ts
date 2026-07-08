declare module NodeJS {
    interface ProcessEnv {
        readonly NODE_ENV: 'development' | 'production' | 'test'
        readonly MASK_SENTRY_DSN: string
        readonly MASK_SENTRY: 'enabled' | 'disabled'
        readonly MASK_MIXPANEL: 'enabled' | 'disabled'
        readonly FIREFLY_X_CLIENT_ID: string
        readonly FIREFLY_X_CLIENT_SECRET: string
        /**
         * Run skip tests like
         * RUN_SKIP_TESTS=1 pnpm test
         */
        readonly RUN_SKIP_TESTS: string
        readonly WEB3_CONSTANTS_RPC: string
        readonly NEXT_PUBLIC_FIREFLY_API_URL: string
        readonly MASK_ENABLE_EXCHANGE: string
        readonly SOLANA_DEFAULT_RPC_URL: string
    }
}
declare namespace NodeJS {
    interface Process {
        env: ProcessEnv
    }
}
declare var process: NodeJS.Process
