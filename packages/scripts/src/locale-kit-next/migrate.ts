import { task } from '../utils/task.js'
export async function migrate() {
    const ts = await import('typescript')
}
task(migrate, 'migrate-lingui', 'Migrate the locale files.')
