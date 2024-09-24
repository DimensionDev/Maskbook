import { Component } from 'react'
import type { CrashUIProps } from './CrashUI.js'
import * as CrashUI from /* webpackDefer: true */ './CrashUI.js'
import type { ErrorBoundaryError } from './context.js'

export class ErrorBoundary extends Component<Partial<CrashUIProps>> {
    static getDerivedStateFromError(error: unknown) {
        return { error, hasError: true }
    }
    override state: { error: unknown; hasError: boolean } = { error: null, hasError: false }
    override render() {
        if (!this.state.hasError) return <>{this.props.children}</>
        return (
            <CrashUI.CrashUI
                subject="Mask"
                onRetry={() => this.setState({ error: null, hasError: false })}
                {...this.props}
                {...normalizeError(this.state.error)}
            />
        )
    }
}

function normalizeError(error: unknown): ErrorBoundaryError {
    let stack = '<stack not available>'
    let type = 'UnknownError'
    let message = 'unknown error'
    if (!error) return { stack, type, message }
    try {
        stack = String((error as any).stack) || '<stack not available>'
        stack = stack.replaceAll(/webpack-internal:.+node_modules\//g, 'npm:')
        // remove webpack-internal:///
        stack = stack.replaceAll(/webpack-internal:\/{3}/g, '')
        stack = stack.replaceAll('chrome-extension://jkoeaghipilijlahjplgbfiocjhldnap', '')
    } catch {}
    try {
        type = String((error as any).name) || '<type not available>'
    } catch {}
    try {
        message = String((error as any).message) || '<message not available>'
    } catch {}
    return { stack, type, message }
}

export function ErrorBoundaryUIOfError(props: Partial<CrashUIProps> & { error: unknown; hasError: boolean }) {
    if (!props.hasError) return null
    return <CrashUI.CrashUI subject="Mask" onRetry={() => {}} {...normalizeError(props.error)} />
}
