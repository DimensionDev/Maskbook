import { watchTask, shell, cleanupWhenExit } from '../utils/index.ts'

export function typescript() {
    return shell`npx tsc -b`
}
export function typescriptWatch() {
    cleanupWhenExit()
    return shell`npx tsc -b -w`
}
watchTask(typescript, typescriptWatch, 'typescript', 'Build TypeScript project reference')
