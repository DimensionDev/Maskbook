import { Box, Button, IconButton, makeStyles, Typography } from '@material-ui/core'
import { Alert, AlertTitle } from '@material-ui/lab'
import React, { useMemo, useState } from 'react'
import { useI18N } from '../../utils/i18n-next-ui'
import ExpandLess from '@material-ui/icons/ExpandLess'
import ExpandMore from '@material-ui/icons/ExpandMore'

export class ErrorBoundary extends React.Component {
    static getDerivedStateFromError(error: unknown) {
        return { error }
    }
    state: { error: Error | null } = { error: null }
    render() {
        if (!this.state.error) return <>{this.props.children}</>
        const error = this.normalizedError
        return <CrashUI {...error} onRetry={() => this.setState({ error: null })} />
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
const useStyle = makeStyles({
    root: { overflowX: 'auto', flex: 1, width: '100%', contain: 'paint', marginTop: 16 },
    title: { userSelect: 'text', marginBottom: 8 },
    stack: { userSelect: 'text', overflowX: 'auto', contain: 'strict', height: 300 },
    buttons: { display: 'flex', gap: '8px' },
})
export function CrashUI(error: { onRetry: () => void; type: string; message: string; stack: string }) {
    const classes = useStyle()
    const { t } = useI18N()
    const [showStack, setShowStack] = useState(false)
    const reportTitle = `[Crash] ${error.type}: ${error.message.slice(0, 80)}${error.message.length > 80 ? '...' : ''}`
    const reportBody = `<!--Thanks for the crash report!
Please write down what you're doing when the crash happened, that will help us to fix it easier!-->

I was ________, then Maskbook report an error.

> ${error.message}

Error stack:
<pre>${error.stack}</pre>

## Build information:

- Version: ${globalThis.browser?.runtime?.getManifest?.()?.version ?? process.env.TAG_NAME?.slice(1)}
- NODE_ENV: ${process.env.NODE_ENV}
- STORYBOOK: ${process.env.STORYBOOK}
- target: ${process.env.target}
- build: ${process.env.build}
- architecture: ${process.env.architecture}
- firefoxVariant: ${process.env.firefoxVariant}
- resolution: ${process.env.resolution}
- BUILD_DATE: ${process.env.BUILD_DATE}
- VERSION: ${process.env.VERSION}

## Git (${process.env.TAG_DIRTY ? '*' : ''}):

${process.env.COMMIT_HASH} (${process.env.BRANCH_NAME}) on tag "${process.env.TAG_NAME}"
${process.env.REMOTE_URL?.toLowerCase()?.includes('DimensionDev') ? '' : process.env.REMOTE_URL}`
    const githubLink = useMemo(() => {
        const url = new URLSearchParams()
        url.set('title', reportTitle)
        url.set('body', reportBody)
        return `https://github.com/DimensionDev/Maskbook/issues/new?` + url.toString()
    }, [reportBody, reportTitle])
    const emailLink = useMemo(() => {
        const url = new URL(`mailto:${t('dashboard_email_address')}`)
        url.searchParams.set('subject', reportTitle)
        url.searchParams.set('body', reportBody)
        return url.toString()
    }, [reportBody, reportTitle, t])
    return (
        <div className={classes.root}>
            <Alert severity="error" variant="outlined">
                <AlertTitle>{t('crash_title')}</AlertTitle>
                <div className={classes.title}>
                    {error.type}: {error.message}
                </div>
                <div className={classes.buttons}>
                    <Button color="primary" variant="contained" onClick={error.onRetry}>
                        {t('crash_retry')}
                    </Button>
                    <Button href={githubLink} color="primary" target="_blank">
                        Report on GitHub
                    </Button>
                    {/* The generated link cannot be used to open mail app */}
                    {/* <Button href={emailLink} color="primary" target="_blank">
                        Report by EMail
                    </Button> */}
                    <Box flex={1}></Box>
                    <IconButton color="inherit" size="small" onClick={() => setShowStack((x) => !x)}>
                        {showStack ? <ExpandMore /> : <ExpandLess />}
                    </IconButton>
                </div>
                {showStack ? (
                    <div className={classes.stack}>
                        <Typography component="pre">
                            <code>{error.stack}</code>
                        </Typography>
                    </div>
                ) : null}
            </Alert>
        </div>
    )
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
