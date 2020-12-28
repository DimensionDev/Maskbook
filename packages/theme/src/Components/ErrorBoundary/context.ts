import { createContext } from 'react'
export interface ErrorBoundaryError {
    type: string
    message: string
    stack: string
}
export const ErrorBoundaryContext = createContext({
    use_i18n() {
        return {
            crash_title_of: (subject: string): string => `${subject} has an error`,
            try_to_recover: (): string => `Try to recover`,
            report_on_github: (): string => `Report on GitHub`,
            report_by_email: (): string => `Report by Email`,
        }
    },
    getTitle({ type, message }: ErrorBoundaryError): string {
        return `[Crash] ${type}: ${message.slice(0, 80)}${message.length > 80 ? '...' : ''}`
    },
    getBody({ message, stack }: ErrorBoundaryError): string {
        return `<!--Thanks for the crash report!
Please write down what you're doing when the crash happened, that will help us to fix it easier!-->

I was *doing something...*, then Maskbook report an error.

> ${message}

Error stack:
<pre>${stack}</pre>`
    },
    getMailtoTarget(): string {
        return 'info@dimension.im'
    },
})
