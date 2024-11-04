import { createContext, useContext, useRef } from 'react'
import type { BuildInfoFile } from '@masknet/flags'
import { useBuildInfo_raw } from '../../hooks/useBuildInfo.js'

export interface ErrorBoundaryError {
    /** Type of the Error */
    type: string
    /** The Error message */
    message: string
    /** The error stack */
    stack: string
}
/**
 * Provide the build info for CrashUI
 */
const BuildInfo = createContext<() => BuildInfoFile>(useBuildInfo_raw)
BuildInfo.displayName = 'BuildInfo'

export function BuildInfoProvider(props: React.PropsWithChildren<{ value: () => BuildInfoFile }>) {
    return <BuildInfo.Provider {...props} />
}
export function useBuildInfo() {
    // eslint-disable-next-line react-compiler/react-compiler
    return useRef(useContext(BuildInfo)).current()
}
export function useBuildInfoMarkdown() {
    const env = useBuildInfo()
    const gitInfo =
        env.COMMIT_HASH ?
            `
## Git (${env.DIRTY ? '*' : ''}):
${env.COMMIT_HASH} (${env.BRANCH_NAME})`
        :   ''

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
