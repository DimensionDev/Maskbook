import { watchTask, shell, cleanupWhenExit } from '../utils/index.ts'

export function typescript() {
    return shell`pnpm exec tsgo -b`
}
export function typescriptWatch() {
    cleanupWhenExit()
    return shell`pnpm exec tsgo -b -w`
}
watchTask(typescript, typescriptWatch, 'typescript', 'Build TypeScript project reference')
