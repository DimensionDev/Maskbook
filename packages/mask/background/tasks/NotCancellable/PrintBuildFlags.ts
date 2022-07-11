console.log('Build info', {
    NODE_ENV: process.env.NODE_ENV,
    VERSION: process.env.VERSION,
    COMMIT_HASH: process.env.COMMIT_HASH,
    COMMIT_DATE: process.env.COMMIT_DATE,
    BUILD_DATE: process.env.BUILD_DATE,
    REMOTE_URL: process.env.REMOTE_URL,
    BRANCH_NAME: process.env.BRANCH_NAME,
    DIRTY: process.env.DIRTY,
    TAG_DIRTY: process.env.TAG_DIRTY,
})
export {}
