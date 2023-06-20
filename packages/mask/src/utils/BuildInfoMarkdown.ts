import { use, cache } from 'react'
const Request = cache(async function () {
    const response = await fetch(browser.runtime.getURL('/build-info.txt'))
    const env = await response.json()
    const gitInfo = env.COMMIT_HASH
        ? `
## Git (${env.DIRTY ? '*' : ''}):

${env.COMMIT_HASH} (${env.BRANCH_NAME})`
        : ''

    const buildInfoMarkdown =
        `## Build info
- Version: ${env.VERSION || 'unknown'}
- NODE_ENV: ${env.NODE_ENV || 'unknown'}
- userAgent: ${navigator.userAgent}
- build: ${env.channel || 'unknown'}
- BUILD_DATE: ${env.BUILD_DATE || 'unknown'}
` + gitInfo
    return buildInfoMarkdown
})
export function useBuildInfo() {
    return use(Request())
}
