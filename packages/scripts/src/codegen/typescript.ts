import { watchTask, shell } from '../utils'

export function typescript() {
    return shell`npx tsc -b`
}
export function typescriptWatch() {
    return shell`npx tsc -b -w`
}
watchTask(typescript, typescriptWatch, 'typescript', 'Build TypeScript project reference')
