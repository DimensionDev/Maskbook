import { Box, Button, IconButton, makeStyles, Typography } from '@material-ui/core'
import { Alert, AlertTitle } from '@material-ui/core'
import { useContext, useMemo, useState } from 'react'
import ExpandLess from '@material-ui/icons/ExpandLess'
import ExpandMore from '@material-ui/icons/ExpandMore'
import { ErrorBoundaryContext, ErrorBoundaryError } from './context'

const useStyle = makeStyles({
    root: { overflowX: 'auto', flex: 1, width: '100%', contain: 'paint', marginTop: 16 },
    title: { userSelect: 'text', marginBottom: 8 },
    stack: { userSelect: 'text', overflowX: 'auto', contain: 'strict', height: 300 },
    buttons: { display: 'flex', gap: '8px' },
})
export type CrashUIProps = ErrorBoundaryError & {
    subject: string
    onRetry: () => void
}
export function CrashUI({ onRetry, subject, ...error }: CrashUIProps) {
    const classes = useStyle()
    const [showStack, setShowStack] = useState(false)
    const { getBody, getTitle, getMailtoTarget, use_i18n } = useContext(ErrorBoundaryContext)
    const t = use_i18n()
    const reportTitle = getTitle(error)
    const reportBody = getBody(error)
    const githubLink = useMemo(() => {
        const url = new URLSearchParams()
        url.set('title', reportTitle)
        url.set('body', reportBody)
        return `https://github.com/DimensionDev/Maskbook/issues/new?` + url.toString()
    }, [reportBody, reportTitle])
    const emailLink = useMemo(() => {
        const url = new URL(`mailto:${getMailtoTarget()}`)
        url.searchParams.set('subject', reportTitle)
        url.searchParams.set('body', reportBody)
        return url.toString()
    }, [getMailtoTarget, reportBody, reportTitle])
    return (
        <div className={classes.root}>
            <Alert severity="error" variant="outlined">
                <AlertTitle>{t.crash_title_of(subject)}</AlertTitle>
                <div className={classes.title}>
                    {error.type}: {error.message}
                </div>
                <div className={classes.buttons}>
                    <Button variant="contained" color="primary" onClick={onRetry}>
                        {t.try_to_recover()}
                    </Button>
                    <Button href={githubLink} color="primary" target="_blank">
                        {t.report_on_github()}
                    </Button>
                    {/* The generated link cannot be used to open mail app */}
                    {/* <Button href={emailLink} color="primary" target="_blank">
                        {t.report_by_email()}
                    </Button> */}
                    <Box sx={{ flex: 1 }} />
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
