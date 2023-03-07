export const buildInfoMarkdown = `## Build info
- Version: ${process.env.VERSION}
- NODE_ENV: ${process.env.NODE_ENV}
- target: ${process.env.engine}
- build: ${process.env.channel}
- architecture: ${process.env.architecture}
- BUILD_DATE: ${process.env.BUILD_DATE}

## Git (${process.env.DIRTY ? '*' : ''}):

${process.env.COMMIT_HASH} (${process.env.BRANCH_NAME})`
