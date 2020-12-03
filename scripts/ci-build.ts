import git from '@nice-labs/git-rev'
import { BUILD_PATH, run } from './utils'

const branch = git.branchName()
const types = ['base', 'chromium', 'firefox', 'gecko', 'iOS', 'chromium-beta']

console.log(`Branch: ${branch}`)

for (const type of types) {
    console.log('#', 'Building for target:', type)
    if (type === 'chromium' && types.includes('base')) {
        // chromium doesn't have it's own changes yet.
        // just copying base version is acceptable
        run(undefined, 'cp', '-v', 'Maskbook.base.zip', 'Maskbook.chromium.zip')
    } else {
        run(undefined, 'npm run', `build:${type.toLowerCase()}`)
        run(BUILD_PATH, 'zip', '-FS', '-r', `../Maskbook.${type}.zip`, '.')
        run(undefined, 'rm', '-rfv', 'build')
    }
}
