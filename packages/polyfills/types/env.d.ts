declare namespace NodeJS {
    interface Process {
        env: ProcessEnv
    }
    interface ProcessEnv {
        readonly NODE_ENV: 'production' | 'development' | 'test'
        readonly MASK_SENTRY_DSN: string
    }
}
declare var process: NodeJS.Process
