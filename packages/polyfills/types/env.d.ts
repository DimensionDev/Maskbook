declare namespace NodeJS {
    interface Process {
        env: ProcessEnv
    }
    interface ProcessEnv {
        readonly NODE_ENV: 'production' | 'development' | 'test'
    }
}
declare var process: NodeJS.Process
