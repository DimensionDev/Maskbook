import { createContext } from 'react'
export interface ErrorBoundaryError {
    /** Type of the Error */
    type: string
    /** The Error message */
    message: string
    /** The error stack */
    stack: string
}
/**
 * Please provide the build info text
 */
export const ErrorBoundaryBuildInfoContext = createContext('')
