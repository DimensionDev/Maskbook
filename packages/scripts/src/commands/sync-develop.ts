import { shell, task } from '../utils/index.ts'

const REPO_URL = 'https://github.com/DimensionDev/Maskbook.git'

export function syncDevelop() {
    return shell`git pull ${REPO_URL} develop --no-rebase`
}

task(syncDevelop, 'sync-develop', 'Sync current branch to develop')
