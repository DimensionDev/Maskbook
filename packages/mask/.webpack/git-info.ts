import emitFile from '@nice-labs/emit-file-webpack-plugin'
import git from '@nice-labs/git-rev'

export function emitGitInfo(reproducible: boolean) {
    return emitFile({
        name: 'git-info.json',
        content: () => JSON.stringify(getGitInfo(reproducible), null, 4),
    })
}

/** Get git info */
export function getGitInfo(reproducible: boolean) {
    try {
        if (!reproducible && git.isRepository()) {
            return {
                BUILD_DATE: new Date().toISOString(),
                VERSION: git.describe('--dirty'),
                TAG_NAME: git.tag(),
                COMMIT_HASH: git.commitHash(true),
                COMMIT_DATE: git.commitDate().toISOString(),
                REMOTE_URL: git.remoteURL(),
                BRANCH_NAME: git.branchName(),
                DIRTY: git.isDirty(),
                TAG_DIRTY: git.isTagDirty(),
            }
        }
    } catch {}
    return {
        BUILD_DATE: new Date(0).toISOString(),
        VERSION: require('../package.json').version + '-reproducible',
        TAG_NAME: 'N/A',
        COMMIT_HASH: 'N/A',
        COMMIT_DATE: 'N/A',
        REMOTE_URL: 'N/A',
        BRANCH_NAME: 'N/A',
        DIRTY: false,
        TAG_DIRTY: false,
    }
}
