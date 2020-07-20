import git from '@nice-labs/git-rev'
import { BUILD_PATH, ROOT_PATH, run } from './utils'

const branch = git.branchName()
const types = ['base', 'chromium', 'firefox', 'gecko', 'iOS']
console.log(`Branch: ${branch}`)
for (const type of types) {
    console.log('#', 'Building for target:', type)
    if (type === 'chromium' && types.includes('base')) {
        // chromium doesn't have it's own changes yet.
        // just copying base version is acceptable
        run(ROOT_PATH, 'cp', '-v', 'Maskbook.base.zip', 'Maskbook.chromium.zip')
    } else {
        run(ROOT_PATH, 'yarn', `build:${type.toLowerCase()}`)
        run(BUILD_PATH, 'zip', '-FS', '-r', `../Maskbook.${type}.zip`, '.')
        run(ROOT_PATH, 'rm', '-rfv', 'build')
    }
}
