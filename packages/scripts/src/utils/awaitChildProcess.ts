import type { ChildProcess } from 'child_process'

export function awaitChildProcess(child: ChildProcess) {
    return new Promise<number>((resolve) => {
        child.on('error', () => resolve(child.exitCode || 0))
        child.on('exit', (code) => resolve(code || 0))
    })
}
