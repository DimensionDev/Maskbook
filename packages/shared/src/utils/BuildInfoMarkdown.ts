export const buildInfoMarkdown =
    typeof process === 'undefined'
        ? ''
        : `## Build info
- Version: ${process.env.VERSION}
- NODE_ENV: ${process.env.NODE_ENV}
- userAgent: ${navigator.userAgent}
- build: ${process.env.channel}
- BUILD_DATE: ${process.env.BUILD_DATE}

## Git (${process.env.DIRTY ? '*' : ''}):

${process.env.COMMIT_HASH} (${process.env.BRANCH_NAME})`
