import { getBuildInfo } from '@masknet/shared-base'
import { use, cache } from 'react'

const Request = cache(getBuildInfo)
export function useBuildInfoMarkdown() {
    const env = use(Request())
    const gitInfo = env.COMMIT_HASH
        ? `
## Git (${env.DIRTY ? '*' : ''}):

${env.COMMIT_HASH} (${env.BRANCH_NAME})`
        : ''

    const buildInfoMarkdown =
        `## Build info
- Version: ${env.VERSION || 'unknown'}
- NODE_ENV: ${process.env.NODE_ENV || 'unknown'}
- userAgent: ${navigator.userAgent}
- build: ${env.channel || 'unknown'}
- BUILD_DATE: ${env.BUILD_DATE || 'unknown'}
` + gitInfo
    return buildInfoMarkdown
}

export function useBuildInfo() {
    return use(Request())
}
