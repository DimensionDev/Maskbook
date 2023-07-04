export function getGitInfo() {
    return {
        BUILD_DATE: new Date(0).toISOString(),
        COMMIT_HASH: 'N/A',
        COMMIT_DATE: 'N/A',
        BRANCH_NAME: 'N/A',
        DIRTY: false,
    }
}
