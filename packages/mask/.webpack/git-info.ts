import git from '@nice-labs/git-rev'

interface GitInfoReport {
    BUILD_DATE?: string | undefined
    COMMIT_HASH?: string | undefined
    COMMIT_DATE?: string | undefined
    BRANCH_NAME?: string | undefined
    DIRTY?: boolean | undefined
}

/** Get git info */
export function getGitInfo(): GitInfoReport {
    const report: GitInfoReport = {}
    try {
        if (!git.default.isRepository()) return report
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
