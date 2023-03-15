import { changeFile, ROOT_PATH, task } from '../utils/index.js'

// resolution: {commit: HASH, repo: git+ssh://git@github.com/ProjectOpenSea/wyvern-js.git, type: git}
// =>
// resolution: {tarball: https://codeload.github.com/ProjectOpenSea/wyvern-schemas/tar.gz/e1a08fcf8ce2b11a0fe9cbdc7c9f77c59fadef26}
export async function fixLockfile() {
    return changeFile(new URL('pnpm-lock.yaml', ROOT_PATH), (content) => {
        return content.replaceAll(
            /commit: (.+), repo: .+\/\/git@github\.com\/(.+)\.git, type: git/g,
            'tarball: https://codeload.github.com/$2/tar.gz/$1',
        )
    })
}
task(fixLockfile, 'fix-lockfile', 'Fix lockfile')
