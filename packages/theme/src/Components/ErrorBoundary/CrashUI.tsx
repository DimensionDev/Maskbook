import { Box, Button, IconButton, Typography } from '@material-ui/core'
import { Alert, AlertTitle, experimentalStyled as styled } from '@material-ui/core'
import { useMemo, useState } from 'react'
import ExpandLess from '@material-ui/icons/ExpandLess'
import ExpandMore from '@material-ui/icons/ExpandMore'
import { useMaskThemeI18N } from '../../locales'
import { useContext } from 'react'
import { ErrorBoundaryBuildInfoContext, ErrorBoundaryError } from './context'

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
    const context = useContext(ErrorBoundaryBuildInfoContext)
    const t = useMaskThemeI18N()

    const [showStack, setShowStack] = useState(false)

    // crash report, will send to GitHub
    const reportTitle = `[Crash] ${error.type}: ${error.message}`
    const reportBody: string = `<!--Thanks for the crash report!
Please write down what you're doing when the crash happened, that will help us to fix it easier!-->

I was *doing something...*, then Mask report an error.

> ${error.message}

Error stack:

<pre>${error.stack}</pre>\n\n${context || ''}`

    const githubLink = useMemo(() => {
        const url = new URLSearchParams()
        url.set('title', reportTitle)
        url.set('body', reportBody)
        return `https://github.com/DimensionDev/Maskbook/issues/new?` + url.toString()
    }, [reportBody, reportTitle])
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
