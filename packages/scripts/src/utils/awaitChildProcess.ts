import type { ChildProcess } from 'child_process'

export function awaitChildProcess(child: ChildProcess) {
    return new Promise<number>((resolve, reject) => {
        const handleExitCode = (code: number | null) => {
            if (code) {
                reject(new Error(`Child process at ${(child as any).cwd} fails: ${child.spawnargs.join(' ')}`))
            } else {
                resolve(0)
            }
        }
        child.on('error', () => handleExitCode(child.exitCode))
        child.on('exit', (code) => handleExitCode(code))
    })
}
