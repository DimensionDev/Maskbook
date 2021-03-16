#!/usr/bin/env ts-node
import git from '@nice-labs/git-rev'
import { BUILD_PATH, run } from '../utils'

const branch = git.branchName()
const types = {
    base: [],
    chromium: ['chromium'],
    firefox: ['firefox'],
    gecko: ['android'],
    iOS: ['iOS'],
    'chromium-beta': ['chromium', 'beta'],
}

console.log(`Branch: ${branch}`)

for (const filename in types) {
    const target = types[filename]
    console.log('#', 'Building for target:', ...target)
    if (filename === 'chromium') {
        // chromium doesn't have it's own changes yet.
        // just copying base version is acceptable
        run(undefined, 'cp', '-v', 'Maskbook.base.zip', 'Maskbook.chromium.zip')
    } else {
        run(undefined, 'npx', 'build', ...target)
        run(BUILD_PATH, 'zip', '-FS', '-r', `../Maskbook.${filename}.zip`, '.')
        run(undefined, 'rm', '-rfv', 'build')
    }
}
