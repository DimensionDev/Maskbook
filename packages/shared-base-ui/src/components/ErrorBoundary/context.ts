import { createContext } from 'react'
import { useBuildInfoMarkdown } from '../../index.js'
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
export const BuildInfo = createContext<() => string>(useBuildInfoMarkdown)
BuildInfo.displayName = 'BuildInfo'
