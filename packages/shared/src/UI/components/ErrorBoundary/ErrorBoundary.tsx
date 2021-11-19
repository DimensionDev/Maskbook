import { Component, forwardRef } from 'react'
import { CrashUIProps, CrashUI } from './CrashUI'
import type { ErrorBoundaryError } from './context'

const map = new WeakMap<React.ComponentType<any>, React.ForwardRefExoticComponent<any>>()
/**
 * Return the ErrorBoundary wrapped version of given Component
 * @param Component The component that need to be wrapped with ErrorBoundary
 */
export function withErrorBoundary<T>(Component: React.ComponentType<T>): React.ComponentType<T> {
    if (map.has(Component)) return map.get(Component)!
    const C = forwardRef((props: T, ref) => <ErrorBoundary children={<Component {...props} ref={ref} />} />)
    map.set(Component, C)
    return C as any
}

export class ErrorBoundary extends Component<Partial<CrashUIProps>> {
    static getDerivedStateFromError(error: unknown) {
        return { error }
    }
    override state: { error: Error | null } = { error: null }
    override render() {
        if (!this.state.error) return <>{this.props.children}</>
        return (
            <CrashUI
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
        try {
            stack = String(this.state.error!.stack!) || '<stack not available>'
            stack = stack.replace(/webpack-internal:.+node_modules\//g, 'npm:')
            // remove webpack-internal:///
            stack = stack.replace(/webpack-internal:\/{3}/g, '')
        } catch {}
        try {
            type = String(this.state.error!.name!) || '<type not available>'
        } catch {}
        try {
            message = String(this.state.error!.message!) || '<message not available>'
        } catch {}
        return { stack, type, message }
    }
}
