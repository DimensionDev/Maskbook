export const buildInfoMarkdown = `## Build info
- Version: ${globalThis.browser?.runtime?.getManifest?.()?.version ?? process.env.VERSION}
- NODE_ENV: ${process.env.NODE_ENV}
- target: ${process.env.engine}
- build: ${process.env.channel}
- architecture: ${process.env.architecture}
- BUILD_DATE: ${process.env.BUILD_DATE}
- VERSION: ${process.env.VERSION}

## Git (${process.env.TAG_DIRTY ? '*' : ''}):

${process.env.COMMIT_HASH} (${process.env.BRANCH_NAME})
${process.env.REMOTE_URL?.toLowerCase()?.includes('DimensionDev') ? '' : process.env.REMOTE_URL}`
