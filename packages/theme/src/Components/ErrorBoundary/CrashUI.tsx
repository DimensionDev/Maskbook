import { Box, Button, IconButton, Typography } from '@material-ui/core'
import { Alert, AlertTitle, experimentalStyled as styled } from '@material-ui/core'
import { useMemo, useState } from 'react'
import ExpandLess from '@material-ui/icons/ExpandLess'
import ExpandMore from '@material-ui/icons/ExpandMore'
import { useMaskThemeI18N } from '../../locales'
import { useContext } from 'react'
import { ErrorBoundaryContext, ErrorBoundaryError } from './context'

export type CrashUIProps = ErrorBoundaryError & {
    /** Type of the Error */
    type: string
    /** The Error message */
    message: string
    /** The error stack */
    stack: string
    /** The component part in the boundary */
    subject: string
    onRetry: () => void
}
export function CrashUI({ onRetry, subject, ...error }: CrashUIProps) {
    const context = useContext(ErrorBoundaryContext)
    const t = useMaskThemeI18N()

    const [showStack, setShowStack] = useState(false)

    // crash report, will send to GitHub
    const reportTitle = (context.error_boundary_report_title || t.error_boundary_report_title)(error)
    const reportBody = (context.error_boundary_report_body || t.error_boundary_report_body)({
        stack: error.stack,
        message: error.message,
        build: context?.getBuildInfo?.() || '',
    })
    const mail = (context.error_boundary_report_mailto || t.error_boundary_report_mailto)()

    const githubLink = useMemo(() => {
        const url = new URLSearchParams()
        url.set('title', reportTitle)
        url.set('body', reportBody)
        return `https://github.com/DimensionDev/Maskbook/issues/new?` + url.toString()
    }, [reportBody, reportTitle])

    const emailLink = useMemo(() => {
        const url = new URL(`mailto:${mail}`)
        url.searchParams.set('subject', reportTitle)
        url.searchParams.set('body', reportBody)
        return url.toString()
    }, [mail, reportBody, reportTitle])
    return (
        <Root>
            <Alert severity="error" variant="outlined">
                <AlertTitle>{t.error_boundary_crash_title({ subject })}</AlertTitle>
                <ErrorTitle>
                    {error.type}: {error.message}
                </ErrorTitle>
                <ActionArea>
                    <Button variant="contained" color="primary" onClick={onRetry}>
                        {t.error_boundary_try_to_recover()}
                    </Button>
                    <Button href={githubLink} color="primary" target="_blank">
                        {t.error_boundary_report_github()}
                    </Button>
                    {/* The generated link cannot be used to open mail app */}
                    {/* <Button href={emailLink} color="primary" target="_blank">
                        {t.report_by_email()}
                    </Button> */}
                    <Box sx={{ flex: 1 }} />
                    <IconButton color="inherit" size="small" onClick={() => setShowStack((x) => !x)}>
                        {showStack ? <ExpandMore /> : <ExpandLess />}
                    </IconButton>
                </ActionArea>
                {showStack ? (
                    <ErrorStack>
                        <Typography component="pre">
                            <code>{error.stack}</code>
                        </Typography>
                    </ErrorStack>
                ) : null}
            </Alert>
        </Root>
    )
}
const Root = styled('div')`
    overflow-x: auto;
    flex: 1;
    width: 100%;
    contain: paint;
    margin-top: 16px;
`

const ErrorTitle = styled('div')`
    user-select: text;
    margin-bottom: 8px;
`

const ErrorStack = styled('div')`
    user-select: text;
    overflow-x: auto;
    contain: strict;
    height: 300px;
`

const ActionArea = styled('div')`
    display: flex;
    gap: 8px;
`
