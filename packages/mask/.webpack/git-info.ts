import { emitJSONFile } from '@nice-labs/emit-file-webpack-plugin'
import git from '@nice-labs/git-rev'

interface GitInfoReport {
    BUILD_DATE: string
    COMMIT_HASH: string
    COMMIT_DATE: string
    BRANCH_NAME: string
    DIRTY: boolean
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
        COMMIT_HASH: 'N/A',
        COMMIT_DATE: 'N/A',
        BRANCH_NAME: 'N/A',
        DIRTY: false,
    }
    try {
        if (reproducible && !git.default.isRepository()) return report
        const DIRTY = git.default.isDirty()
        report.BUILD_DATE = new Date().toISOString()
        report.COMMIT_HASH = git.default.commitHash()
        report.COMMIT_DATE = git.default.commitDate().toISOString()
        report.BRANCH_NAME = git.default.branchName()
        report.DIRTY = DIRTY
    } catch {
        // ignore
    }
    return report
}
