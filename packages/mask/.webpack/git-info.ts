import { emitJSONFile } from '@nice-labs/emit-file-webpack-plugin'
import git from '@nice-labs/git-rev'

interface GitInfoReport {
    BUILD_DATE: string
    VERSION: string
    TAG_NAME: string
    COMMIT_HASH: string
    COMMIT_DATE: string
    REMOTE_URL: string
    BRANCH_NAME: string
    DIRTY: boolean
    TAG_DIRTY: boolean
}

export function emitGitInfo(reproducible: boolean) {
    return emitJSONFile<GitInfoReport>({
        name: 'git-info.json',
        content: getGitInfo(reproducible),
        space: 4,
    })
}

/** Get git info */
export function getGitInfo(reproducible: boolean): GitInfoReport {
    const report: GitInfoReport = {
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
    try {
        if (reproducible && !git.isRepository()) return report
        report.BUILD_DATE = new Date().toISOString()
        report.VERSION = git.describe('--dirty')
        report.TAG_NAME = git.tag()
        report.COMMIT_HASH = git.commitHash(true)
        report.COMMIT_DATE = git.commitDate().toISOString()
        report.REMOTE_URL = git.remoteURL()
        report.BRANCH_NAME = git.branchName()
        report.DIRTY = git.isDirty()
        report.TAG_DIRTY = git.isTagDirty()
    } catch {
        // ignore
    }
    return report
}
