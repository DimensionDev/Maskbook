console.log('Build info', {
    NODE_ENV: process.env.NODE_ENV,
    VERSION: process.env.VERSION,
    TAG_NAME: process.env.TAG_NAME,
    COMMIT_HASH: process.env.COMMIT_HASH,
    COMMIT_DATE: process.env.COMMIT_DATE,
    BUILD_DATE: process.env.BUILD_DATE,
    REMOTE_URL: process.env.REMOTE_URL,
    BRANCH_NAME: process.env.BRANCH_NAME,
    DIRTY: process.env.DIRTY,
    TAG_DIRTY: process.env.TAG_DIRTY,
})
export const buildInfoMarkdown = `## Build info
- Version: ${globalThis.browser?.runtime?.getManifest?.()?.version ?? process.env.TAG_NAME?.slice(1)}
- NODE_ENV: ${process.env.NODE_ENV}
- STORYBOOK: ${process.env.STORYBOOK}
- target: ${process.env.target}
- build: ${process.env.build}
- architecture: ${process.env.architecture}
- firefoxVariant: ${process.env.firefoxVariant}
- resolution: ${process.env.resolution}
- BUILD_DATE: ${process.env.BUILD_DATE}
- VERSION: ${process.env.VERSION}

## Git (${process.env.TAG_DIRTY ? '*' : ''}):

${process.env.COMMIT_HASH} (${process.env.BRANCH_NAME}) on tag "${process.env.TAG_NAME}"
${process.env.REMOTE_URL?.toLowerCase()?.includes('DimensionDev') ? '' : process.env.REMOTE_URL}`
