import { Component } from 'react'
import type { CrashUIProps } from './CrashUI.js'
import * as CrashUI from /* webpackDefer: true */ './CrashUI.js'
import type { ErrorBoundaryError } from './context.js'

// eslint-disable-next-line react/no-class-component
export class ErrorBoundary extends Component<Partial<CrashUIProps>> {
    static getDerivedStateFromError(error: unknown) {
        return { error }
    }
    override state: {
        error: Error | null
    } = { error: null }
    override render() {
        if (!this.state.error) return <>{this.props.children}</>
        return (
            <CrashUI.CrashUI
                subject="Mask"
                onRetry={() => this.setState({ error: null })}
                {...this.props}
                {...this.normalizedError}
            />
        )
    }
    private get normalizedError(): ErrorBoundaryError {
        let stack = '<stack not available>'
        let type = 'UnknownError'
        let message = 'unknown error'
        if (!this.state.error) return { stack, type, message }
        try {
            stack = String(this.state.error.stack!) || '<stack not available>'
            stack = stack.replaceAll(/webpack-internal:.+node_modules\//g, 'npm:')
            // remove webpack-internal:///
            stack = stack.replaceAll(/webpack-internal:\/{3}/g, '')
        } catch {}
        try {
            type = String(this.state.error.name) || '<type not available>'
        } catch {}
        try {
            message = String(this.state.error.message) || '<message not available>'
        } catch {}
        return { stack, type, message }
    }
}
