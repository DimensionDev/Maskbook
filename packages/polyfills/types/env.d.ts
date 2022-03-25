declare namespace NodeJS {
    interface Process {
        env: ProcessEnv
    }
    interface ProcessEnv {
        readonly NODE_ENV: 'production' | 'development'
        readonly architecture: 'app' | 'web'
    }
}
declare var process: NodeJS.Process
