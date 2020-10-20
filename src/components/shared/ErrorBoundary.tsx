import { Button, Typography } from '@material-ui/core'
import { Alert, AlertTitle } from '@material-ui/lab'
import React from 'react'

export class ErrorBoundary extends React.Component {
    static getDerivedStateFromError(error: unknown) {
        return { error }
    }
    state: { error: Error | null } = { error: null }
    render() {
        if (!this.state.error) return <>{this.props.children}</>
        const error = this.normalizedError
        return (
            <div style={{ overflowX: 'auto', flex: 1, width: '100%', contain: 'strict', marginTop: 16 }}>
                <Alert
                    severity="error"
                    variant="outlined"
                    action={
                        <Button color="inherit" size="large" onClick={() => this.setState({ error: null })}>
                            Retry
                        </Button>
                    }>
                    <AlertTitle>Maskbook has an error:</AlertTitle>
                    <span style={{ userSelect: 'text' }}>
                        {error.type}: {error.message}
                    </span>
                </Alert>
                <Typography component="pre" style={{ maxWidth: '100%', overflowX: 'auto' }}>
                    <code style={{ fontSize: 15, userSelect: 'text' }}>{error.stack}</code>
                </Typography>
            </div>
        )
    }
    get normalizedError() {
        let stack = '<stack not available>'
        let type = 'UnknownError'
        let message = 'unknown error'
        try {
            stack = String(this.state.error!.stack!) || '<stack not available>'
            stack = stack.replace(/webpack-internal:\/\/\//g, '')
            stack = stack.replace(/\.\/node_modules\//g, '')
        } catch {}
        try {
            type = String(this.state.error!.name!) || '<stack not available>'
        } catch {}
        try {
            message = String(this.state.error!.message!) || '<stack not available>'
        } catch {}
        return { stack, type, message }
    }
}

const map = new WeakMap<React.ComponentType<any>, React.ComponentType<any>>()
export function withErrorBoundary<T>(Comp: React.ComponentType<T>): React.ComponentType<T> {
    if (map.has(Comp)) return map.get(Comp)!
    return map
        .set(Comp, (props: T) => (
            <ErrorBoundary>
                <Comp {...props} />
            </ErrorBoundary>
        ))
        .get(Comp)!
}
